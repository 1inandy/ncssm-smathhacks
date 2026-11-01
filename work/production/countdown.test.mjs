import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingTime } from '../../countdown-time.js';
const target = '2027-03-13T00:00:00-05:00';
test('explicit Eastern target is 05:00 UTC on March 13', () => {
  assert.equal(Date.parse(target), Date.parse('2027-03-13T05:00:00Z'));
});
test('day/hour/minute/second decomposition', () => {
  assert.deepEqual(remainingTime(target, Date.parse(target) - 90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, arrived: false });
});
test('exact target and past target stop at zero', () => {
  for (const delta of [0, 1, 86400000]) assert.deepEqual(remainingTime(target, Date.parse(target) + delta), { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true });
});
test('last partial second never shows a premature arrival', () => {
  assert.equal(remainingTime(target, Date.parse(target) - 1).seconds, 1);
  assert.equal(remainingTime(target, Date.parse(target) - 1).arrived, false);
});
test('invalid and timezone-free targets are rejected', () => {
  for (const bad of [null, '', 'invalid', '2027-03-13', '2027-03-13T00:00:00']) assert.equal(remainingTime(bad), null);
});
