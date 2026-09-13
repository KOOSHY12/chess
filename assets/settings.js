// Engine settings UI controller for the extension popup.
(function () {
  const defaults = {
    depth: 12,
    seconds: 2,
    autoMove: false,
    bestMoveArrow: false
  };

  function clampDepth(value) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return defaults.depth;
    if (n < 5) return 5;
    if (n > 100) return 100;
    return n;
  }

  function clampSeconds(value) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return defaults.seconds;
    if (n < 1) return 1;
    if (n > 60) return 60;
    return n;
  }

  function normalizeBoolean(value, fallback) {
    return value === true || value === 'true' || value === 1 || value === '1' ? true : fallback;
  }

  function readSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get({
          engineDepth: defaults.depth,
          engineSeconds: defaults.seconds,
          autoMove: defaults.autoMove,
          bestMoveArrow: defaults.bestMoveArrow
        }, (data) => {
          resolve({
            depth: clampDepth(data.engineDepth),
            seconds: clampSeconds(data.engineSeconds),
            autoMove: normalizeBoolean(data.autoMove, defaults.autoMove),
            bestMoveArrow: normalizeBoolean(data.bestMoveArrow, defaults.bestMoveArrow)
          });
        });
      } else {
        resolve({
          depth: defaults.depth,
          seconds: defaults.seconds,
          autoMove: defaults.autoMove,
          bestMoveArrow: defaults.bestMoveArrow
        });
      }
    });
  }

  function saveSettings(depth, seconds, autoMove, bestMoveArrow) {
    const d = clampDepth(depth);
    const s = clampSeconds(seconds);
    const a = Boolean(autoMove);
    const b = Boolean(bestMoveArrow);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ engineDepth: d, engineSeconds: s, autoMove: a, bestMoveArrow: b });
    }
    return { depth: d, seconds: s, autoMove: a, bestMoveArrow: b };
  }

  function applySettings() {
    const depthInput = document.getElementById('engineDepth');
    const secondsInput = document.getElementById('engineSeconds');
    const autoMoveInput = document.getElementById('autoMove');
    const bestMoveArrowInput = document.getElementById('bestMoveArrow');
    const statusMessage = document.getElementById('statusMessage');
    const button = document.getElementById('saveSettings');

    readSettings().then((settings) => {
      depthInput.value = settings.depth;
      secondsInput.value = settings.seconds;
      autoMoveInput.checked = settings.autoMove;
      bestMoveArrowInput.checked = settings.bestMoveArrow;
    });

    button.addEventListener('click', () => {
      const settings = saveSettings(depthInput.value, secondsInput.value, autoMoveInput.checked, bestMoveArrowInput.checked);
      if (statusMessage) {
        statusMessage.textContent = `Depth ${settings.depth}, Seconds ${settings.seconds}, Auto ${settings.autoMove}, Arrow ${settings.bestMoveArrow}`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySettings);
  } else {
    applySettings();
  }
})();
