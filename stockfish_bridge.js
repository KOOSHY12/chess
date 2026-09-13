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

function buildSearchCommand(depthValue, secondsValue) {
  const requestedDepth = normalizeDepth(depthValue || '12');
  const requestedSeconds = normalizeSeconds(secondsValue || '0');

  if (requestedSeconds > 0) {
    const ms = requestedSeconds * 1000;
    return { mode: 'seconds', command: `go movetime ${ms}`, depth: requestedDepth, seconds: requestedSeconds };
  }

  return { mode: 'depth', command: `go depth ${requestedDepth}`, depth: requestedDepth, seconds: requestedSeconds };
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

async function main() {
  const engine = await createEngine('full');
  const requestedDepth = normalizeDepth(process.env.ENGINE_DEPTH || process.env.DEPTH || '12');
  const requestedSeconds = normalizeSeconds(process.env.ENGINE_SECONDS || process.env.SECONDS || '0');
  const command = buildSearchCommand(requestedDepth, requestedSeconds);

  console.log('Loaded Stockfish.js 18 engine successfully.');
  engine.sendCommand('setoption name Threads value 4');
  engine.sendCommand('ucinewgame');
  engine.sendCommand('position startpos');
  engine.sendCommand(command.command);

  console.log(`Engine configured with depth=${command.depth} seconds=${command.seconds} mode=${command.mode}.`);
  console.log('Bridge is ready to plug into the extension UI or background page.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { parseIntSafe, normalizeDepth, normalizeSeconds, buildSearchCommand, createEngine };
