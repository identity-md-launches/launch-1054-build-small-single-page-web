import './styles.css';
import { formatPercent, formatWhole, groups, parsePercentage, parseSupply, planText, presets, tokenAmount } from './model.ts';

function get<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing interface element: ${selector}`);
  return element;
}

const controls = get<HTMLDivElement>('#allocation-controls');
const breakdown = get<HTMLDListElement>('#breakdown');
const supplyInput = get<HTMLInputElement>('#supply');
const presetInput = get<HTMLSelectElement>('#preset');
const undoButton = get<HTMLButtonElement>('#undo');
const actionStatus = get<HTMLParagraphElement>('#action-status');
const exportNote = get<HTMLParagraphElement>('#export-note');
const defaultExportNote = exportNote.textContent;

// Only constant, authored group data is inserted as markup. User values use textContent.
controls.innerHTML = groups.map((group, i) => `
  <div class="allocation-row" style="--group-color: ${group.color}">
    <div class="allocation-row-top">
      <div class="group-title"><span class="swatch" aria-hidden="true"></span><div><label for="${group.id}-percent">${group.name}</label><p id="${group.id}-hint">${group.description}</p></div></div>
      <div class="percent-control"><input id="${group.id}-percent" class="percent-input" name="${group.id}" type="text" inputmode="decimal" autocomplete="off" maxlength="6" value="${formatPercent(presets.community[i])}" aria-describedby="${group.id}-hint ${group.id}-error" aria-label="${group.name} percentage" /><span aria-hidden="true">%</span></div>
    </div>
    <label class="sr-only" for="${group.id}-range">Adjust ${group.name} percentage</label>
    <input class="range-input" id="${group.id}-range" type="range" min="0" max="1000" step="1" value="${presets.community[i]}" aria-valuetext="${formatPercent(presets.community[i])}%" />
    <p class="field-error" id="${group.id}-error" hidden></p>
  </div>`).join('');

breakdown.innerHTML = groups.map(group => `
  <div class="breakdown-row" style="--group-color: ${group.color}"><dt><span class="swatch" aria-hidden="true"></span>${group.name}<span class="breakdown-percent" id="${group.id}-share"></span></dt><dd id="${group.id}-amount"></dd></div>`).join('');

const percentInputs = groups.map(group => get<HTMLInputElement>(`#${group.id}-percent`));
const rangeInputs = groups.map(group => get<HTMLInputElement>(`#${group.id}-range`));

type Draft = { supply: string; percentages: string[]; preset: string };
const history: Draft[] = [];
let editTarget: EventTarget | null = null;

function snapshot(): Draft {
  return { supply: supplyInput.value, percentages: percentInputs.map(input => input.value), preset: presetInput.value };
}

function remember(target: EventTarget | null) {
  if (editTarget === target) return;
  history.push(snapshot());
  if (history.length > 30) history.shift();
  editTarget = target;
  undoButton.disabled = false;
}

// Capture before input mutates the value, and group a continuous field edit into one undo.
for (const input of [supplyInput, ...percentInputs, ...rangeInputs]) {
  input.addEventListener('focus', () => { editTarget = null; });
  input.addEventListener('pointerdown', () => { editTarget = null; remember(input); });
  input.addEventListener('beforeinput', () => remember(input));
  input.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) remember(input);
  });
}

function setError(input: HTMLInputElement, error: HTMLElement, message: string) {
  input.setAttribute('aria-invalid', String(Boolean(message)));
  error.textContent = message;
  error.hidden = !message;
}

function render() {
  const supply = parseSupply(supplyInput.value);
  const parsed = percentInputs.map(input => parsePercentage(input.value));
  const validPercentages = parsed.every((n): n is number => n !== null);
  const allocations = parsed.map(n => n ?? 0);
  const total = allocations.reduce((sum, n) => sum + n, 0);

  setError(supplyInput, get('#supply-error'), supply === null ? 'Enter a whole number from 1 to 999,999,999,999,999. Commas are optional.' : '');
  groups.forEach((group, i) => {
    const value = parsed[i];
    setError(percentInputs[i], get(`#${group.id}-error`), value === null ? 'Enter 0 to 100, with at most one decimal place.' : '');
    if (value !== null) rangeInputs[i].value = String(value);
    rangeInputs[i].style.setProperty('--range-fill', `${value === null ? 0 : value / 10}%`);
    rangeInputs[i].setAttribute('aria-valuetext', value === null ? 'Use the percentage field to correct this value' : `${formatPercent(value)}%`);
    get(`#${group.id}-share`).textContent = value === null ? '—' : `${formatPercent(value)}%`;
    get(`#${group.id}-amount`).textContent = supply === null || value === null ? '—' : tokenAmount(supply, value);
  });

  const donut = get('#donut');
  const status = get('#allocation-status');
  const totalLabel = get('#total-percent');
  const caption = get('#chart-caption');
  totalLabel.textContent = validPercentages ? formatPercent(total) : '—';
  if (validPercentages) {
    const symbol = document.createElement('span');
    symbol.textContent = '%';
    totalLabel.append(symbol);
  }

  const totalValid = validPercentages && total === 1000;
  const valid = totalValid && supply !== null;
  let message: string;
  if (!validPercentages) {
    message = 'Check the highlighted percentages.';
    caption.textContent = 'Correct a percentage to continue';
  } else if (total > 1000) {
    message = `Remove ${formatPercent(total - 1000)}% to reach 100%.`;
    caption.textContent = 'Over the total supply';
  } else if (total < 1000) {
    message = `${formatPercent(1000 - total)}% left to allocate.`;
    caption.textContent = total === 0 ? 'A fresh start for your idea' : 'A little room to work with';
  } else {
    message = supply === null ? 'Enter a valid supply to finish your plan.' : '100% allocated. Your plan is ready.';
    caption.textContent = 'Every token has a place';
  }
  status.classList.toggle('is-ready', valid);
  status.classList.toggle('is-error', !validPercentages || total > 1000 || supply === null);
  status.textContent = `${valid ? '✓' : '○'} ${message}`;

  // Overallocated splits are not normalized: a scaled chart would misrepresent supply.
  if (validPercentages && total <= 1000) {
    let offset = 0;
    const stops = groups.map((group, i) => {
      const start = offset;
      offset += allocations[i] / 10;
      return `${group.color} ${start}% ${offset}%`;
    });
    stops.push(`var(--chart-empty) ${offset}% 100%`);
    donut.style.background = `conic-gradient(${stops.join(',')})`;
  } else {
    donut.style.background = 'var(--chart-empty)';
  }
  donut.classList.toggle('is-paused', !validPercentages || total > 1000);
  get('#supply-caption').textContent = supply === null ? 'Set a valid supply' : `${formatWhole(supply)} total`;
  get('#remainder').hidden = !validPercentages || total >= 1000;
  get('#remainder-value').textContent = supply === null ? '—' : tokenAmount(supply, Math.max(0, 1000 - total));
  exportNote.textContent = defaultExportNote;
  actionStatus.textContent = '';
}

supplyInput.addEventListener('input', render);
supplyInput.addEventListener('blur', () => {
  const supply = parseSupply(supplyInput.value);
  if (supply !== null) supplyInput.value = formatWhole(supply);
});

percentInputs.forEach((input, i) => {
  input.addEventListener('input', () => { presetInput.value = 'custom'; render(); });
  input.addEventListener('blur', () => {
    const value = parsePercentage(input.value);
    if (value !== null) input.value = formatPercent(value);
  });
  rangeInputs[i].addEventListener('input', () => {
    input.value = formatPercent(Number(rangeInputs[i].value));
    presetInput.value = 'custom';
    render();
  });
});

// The select changes before its change event; capture its old value at interaction start.
let previousPreset = presetInput.value;
presetInput.addEventListener('focus', () => { previousPreset = presetInput.value; });
presetInput.addEventListener('change', () => {
  const preset = presets[presetInput.value];
  if (!preset) return;
  const saved = snapshot();
  saved.preset = previousPreset;
  history.push(saved);
  if (history.length > 30) history.shift();
  undoButton.disabled = false;
  percentInputs.forEach((input, i) => { input.value = formatPercent(preset[i]); });
  previousPreset = presetInput.value;
  editTarget = null;
  render();
});

undoButton.addEventListener('click', () => {
  let draft = history.pop();
  // Pointer/focus preparation can capture an unchanged state. Skip those entries.
  while (draft && JSON.stringify(draft) === JSON.stringify(snapshot())) draft = history.pop();
  if (draft) {
    supplyInput.value = draft.supply;
    percentInputs.forEach((input, i) => { input.value = draft.percentages[i]; });
    presetInput.value = draft.preset;
    previousPreset = draft.preset;
    render();
    actionStatus.textContent = 'Previous split restored.';
  }
  editTarget = null;
  undoButton.disabled = history.length === 0;
});

get('#download').addEventListener('click', () => {
  const supply = parseSupply(supplyInput.value);
  const values = percentInputs.map(input => parsePercentage(input.value));
  const errorInput = supply === null ? supplyInput : percentInputs.find((_, i) => values[i] === null);
  if (errorInput) {
    exportNote.textContent = 'Correct the highlighted field, then download your plan.';
    actionStatus.textContent = exportNote.textContent;
    errorInput.focus();
    return;
  }
  const allocations = values as number[];
  if (allocations.reduce((sum, n) => sum + n, 0) !== 1000) {
    exportNote.textContent = 'Adjust the percentages to exactly 100%, then download your plan.';
    actionStatus.textContent = exportNote.textContent;
    percentInputs[0].focus();
    return;
  }
  const blob = new Blob([planText(supply!, allocations)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'token-split-plan.txt';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  exportNote.textContent = 'Download requested. If it did not appear, check whether your host allows downloads.';
  actionStatus.textContent = exportNote.textContent;
});

render();
