export const groups = [
  { id: 'community', name: 'Community', description: 'Rewards, airdrops & participation', color: 'var(--chart-community)' },
  { id: 'liquidity', name: 'Liquidity', description: 'Tokens set aside for trading pools', color: 'var(--chart-liquidity)' },
  { id: 'contributors', name: 'Contributors', description: 'People building the project', color: 'var(--chart-contributors)' },
  { id: 'treasury', name: 'Treasury', description: 'Future work & community reserves', color: 'var(--chart-treasury)' },
] as const;

export const presets: Record<string, readonly number[]> = {
  community: [500, 200, 150, 150],
  equal: [250, 250, 250, 250],
  blank: [0, 0, 0, 0],
};

// Integer tenths of a percent avoid floating-point totals such as 99.999999%.
export function parsePercentage(raw: string): number | null {
  if (!/^\d{1,3}(\.\d)?$/.test(raw.trim())) return null;
  const units = Math.round(Number(raw) * 10);
  return units <= 1000 ? units : null;
}

export function parseSupply(raw: string): bigint | null {
  const trimmed = raw.trim();
  if (!/^(?:\d{1,15}|\d{1,3}(?:,\d{3}){1,4})$/.test(trimmed)) return null;
  const supply = BigInt(trimmed.replaceAll(',', ''));
  return supply > 0n && supply <= 999999999999999n ? supply : null;
}

export function formatPercent(units: number): string {
  return (units / 10).toFixed(units % 10 === 0 ? 0 : 1);
}

export function formatWhole(value: bigint): string {
  return value.toLocaleString('en-US');
}

export function tokenAmount(supply: bigint, units: number): string {
  const thousandths = supply * BigInt(units);
  const fraction = (thousandths % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
  return formatWhole(thousandths / 1000n) + (fraction ? `.${fraction}` : '');
}

export function planText(supply: bigint, allocations: readonly number[]): string {
  if (allocations.length !== groups.length || allocations.some(n => !Number.isInteger(n) || n < 0 || n > 1000) || allocations.reduce((sum, n) => sum + n, 0) !== 1000) {
    throw new Error('A finished plan must allocate exactly 100%.');
  }
  return [
    'TOKEN SPLIT',
    'A community allocation sketch',
    '',
    `Total supply: ${formatWhole(supply)} tokens`,
    '',
    ...groups.map((group, i) => `${group.name}: ${formatPercent(allocations[i])}% | ${tokenAmount(supply, allocations[i])} tokens`),
    '',
    'Total allocated: 100%',
    '',
    'Amounts = supply x allocation / 100. Exact to at most three decimal places.',
    'Illustrative plan only. No onchain data, vesting, prices, token decimal rules, or voting power are modeled.',
    'Created locally with Token Split. No wallet or account was used.',
    '',
  ].join('\n');
}
