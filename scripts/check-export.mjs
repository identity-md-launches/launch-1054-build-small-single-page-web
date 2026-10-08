import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const excluded = new Set(['.git', '.github', '.imd', '.agents', '.codex', '.playwright-mcp']);
const generated = new Set(['node_modules', '.npm', '.cache', '.vite', '.vite-temp', 'coverage', 'test-results', 'playwright-report']);

function collect(relative = '') {
  return readdirSync(resolve(root, relative), { withFileTypes: true }).flatMap(entry => {
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (excluded.has(entry.name) || entry.name.startsWith('.env') || path === 'test/scratch' || path === 'artifacts/submission.json') return [];
    assert(!generated.has(entry.name), `Generated dependency/cache path found: ${path}`);
    assert(!entry.isSymbolicLink(), `Unexpected symbolic link: ${path}`);
    assert(!/\.(?:tgz|tar|zip)$/.test(entry.name), `Unnecessary archive: ${path}`);
    return entry.isDirectory() ? collect(path) : [{ path, bytes: statSync(resolve(root, path)).size }];
  });
}

const html = readFileSync('dist/index.html', 'utf8');
assert(html.includes('lang="en"'), 'English document language missing');
assert(html.includes("connect-src 'none'"), 'Runtime connections are not blocked');
const assets = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)].map(match => match[1]);
assert(assets.length >= 3, 'Expected local JavaScript, stylesheet and favicon');
for (const asset of assets) {
  assert(asset.startsWith('./'), `Non-relative runtime asset URL: ${asset}`);
  assert(!asset.includes('..'), `Asset escapes export: ${asset}`);
  assert(existsSync(resolve('dist', asset)), `Missing runtime asset: ${asset}`);
}
assert(statSync('.gitignore').size <= 512, 'Ignore-file path budget exceeded');
assert(!/^\/?dist\/?$/m.test(readFileSync('.gitignore', 'utf8')), 'Production export must be included');
const files = collect();
const payloadBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const reportAllowance = 4096;
const archiveHeaderAllowance = (files.length + 24) * 4096;
assert(payloadBytes + reportAllowance + archiveHeaderAllowance < 8_388_608, 'Submission size budget exceeded');
const exportFiles = files.filter(file => file.path.startsWith('dist/')).map(file => ({
  ...file,
  sha256: createHash('sha256').update(readFileSync(file.path)).digest('hex'),
}));
const report = {
  result: 'passed',
  runtimeAssets: assets,
  exportFiles,
  exportBytes: exportFiles.reduce((sum, file) => sum + file.bytes, 0),
  submissionFilesExcludingReport: files.length,
  payloadBytesExcludingReport: payloadBytes,
  reportAllowanceBytes: reportAllowance,
  archiveHeaderAllowanceBytes: archiveHeaderAllowance,
  conservativeSubmissionBytes: payloadBytes + reportAllowance + archiveHeaderAllowance,
  limitBytes: 8_388_608,
  scope: 'All deliverable files, excluding supplied inputs, protected metadata and disposable browser/scratch output. Git metadata is not read or modified.',
};
const json = `${JSON.stringify(report, null, 2)}\n`;
assert(Buffer.byteLength(json) <= reportAllowance);
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/submission.json', json);
console.log(`PASS: ${exportFiles.length} export files, ${report.exportBytes} bytes; ${report.conservativeSubmissionBytes} conservative submission bytes / ${report.limitBytes}.`);
