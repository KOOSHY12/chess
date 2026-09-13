#!/usr/bin/env node
'use strict';

const engineFactory = require('stockfish');

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
  console.log('Loaded Stockfish.js 18 engine successfully.');
  engine.sendCommand('setoption name Threads value 4');
  engine.sendCommand('ucinewgame');
  engine.sendCommand('position startpos');
  engine.sendCommand('go depth 12');
  console.log('Bridge is ready to plug into the extension UI or background page.');
})();
