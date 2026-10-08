import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSupply, parsePercentage, formatPercent, tokenAmount, planText } from '../src/model.ts';

test('supply accepts whole tokens and correctly grouped English commas', () => {
  assert.equal(parseSupply(' 1,000,000 '), 1000000n);
  assert.equal(parseSupply('999,999,999,999,999'), 999999999999999n);
  for (const value of ['', '0', '-1', '1.5', '1e6', '1,00', '1,,000', '1 000', '1000000000000000', '<script>']) {
    assert.equal(parseSupply(value), null, value);
  }
});

test('percentage parsing distinguishes missing, malformed and legitimate zero values', () => {
  assert.equal(parsePercentage('0'), 0);
  assert.equal(parsePercentage('100.0'), 1000);
  assert.equal(parsePercentage('33.3'), 333);
  assert.equal(parsePercentage(' 0.1 '), 1);
  for (const value of ['', '.', '100.1', '-1', '2.55', 'NaN', '1e1', '1,5', 'Infinity']) {
    assert.equal(parsePercentage(value), null, value);
  }
  assert.equal(formatPercent(333), '33.3');
  assert.equal(formatPercent(0), '0');
});

test('amounts are exact even at the maximum supply and smallest percentage', () => {
  assert.equal(tokenAmount(1000000n, 333), '333,000');
  assert.equal(tokenAmount(1n, 1), '0.001');
  assert.equal(tokenAmount(7n, 333), '2.331');
  assert.equal(tokenAmount(999999999999999n, 999), '998,999,999,999,999.001');
  assert.equal(tokenAmount(999999999999999n, 1), '999,999,999,999.999');
  assert.equal(tokenAmount(1n, 0), '0');
});

test('a completed fractional plan conserves supply without floating-point drift', () => {
  const values = [333, 333, 333, 1];
  assert.equal(values.reduce((sum, n) => sum + n, 0), 1000);
  const output = planText(7n, values);
  assert.match(output, /Community: 33.3% \| 2.331 tokens/);
  assert.match(output, /Treasury: 0.1% \| 0.007 tokens/);
  assert.match(output, /Total allocated: 100%/);
  assert.equal([2331, 2331, 2331, 7].reduce((sum, n) => sum + n), 7000);
});

test('export refuses underallocation, overallocation and malformed groups', () => {
  for (const values of [[0, 0, 0, 0], [500, 500, 500, 500], [500, 500], [1001, -1, 0, 0], [250.5, 249.5, 250, 250]]) {
    assert.throws(() => planText(100n, values), /exactly 100%/);
  }
});
