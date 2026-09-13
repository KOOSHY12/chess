#!/usr/bin/env node
'use strict';

const engineFactory = require('stockfish');

function parseIntSafe(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDepth(value) {
  const depth = parseIntSafe(value, 12);
  if (depth < 5) return 5;
  if (depth > 100) return 100;
  return depth;
}

function normalizeSeconds(value) {
  const seconds = parseIntSafe(value, 0);
  if (seconds < 1) return 0;
  return seconds;
}

function createEngine(enginePath = 'full') {
  return new Promise((resolve, reject) => {
    try {
      engineFactory(enginePath, (err, engine) => {
        if (err) {
          reject(err);
          return;
        }
        if (!engine || typeof engine.sendCommand !== 'function') {
          reject(new Error('Stockfish engine did not initialize correctly.'));
          return;
        }
        // Higher strength default from Stockfish.js 18 is available through the
        // full WASM engine. Use one or all of the UCI options the browser
        // extension can expose in the UI.
        engine.sendCommand('uci');
        engine.sendCommand('isready');
        resolve(engine);
      });
    } catch (e) {
      reject(e);
    }
  });
}

(async function main() {
  const engine = await createEngine('full');
  const requestedDepth = normalizeDepth(process.env.ENGINE_DEPTH || process.env.DEPTH || '12');
  const requestedSeconds = normalizeSeconds(process.env.ENGINE_SECONDS || process.env.SECONDS || '0');

  console.log('Loaded Stockfish.js 18 engine successfully.');
  engine.sendCommand('setoption name Threads value 4');
  engine.sendCommand('ucinewgame');
  engine.sendCommand('position startpos');

  if (requestedSeconds > 0) {
    const ms = requestedSeconds * 1000;
    engine.sendCommand(`go movetime ${ms}`);
    console.log(`Engine configured with seconds=${requestedSeconds} -> go movetime ${ms}.`);
  } else {
    engine.sendCommand(`go depth ${requestedDepth}`);
    console.log(`Engine configured with depth=${requestedDepth}.`);
  }

  console.log('Bridge is ready to plug into the extension UI or background page.');
})();
