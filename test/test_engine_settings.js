const assert = require('assert');
const { normalizeDepth, normalizeSeconds, buildSearchCommand } = require('../stockfish_bridge.js');

assert.strictEqual(normalizeDepth('3'), 5);
assert.strictEqual(normalizeDepth('101'), 100);
assert.strictEqual(normalizeDepth('12'), 12);

assert.strictEqual(normalizeSeconds('0'), 0);
assert.strictEqual(normalizeSeconds('2'), 2);

const depthCmd = buildSearchCommand(12, 0);
assert.strictEqual(depthCmd.mode, 'depth');
assert.strictEqual(depthCmd.command, 'go depth 12');

const timeCmd = buildSearchCommand(12, 3);
assert.strictEqual(timeCmd.mode, 'seconds');
assert.strictEqual(timeCmd.command, 'go movetime 3000');

console.log('engine-control smoke tests passed');
