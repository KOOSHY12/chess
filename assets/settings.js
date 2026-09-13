// Engine settings UI controller for the extension popup.
(function () {
  const defaults = {
    depth: 12,
    seconds: 2
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

  function readSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get({ engineDepth: defaults.depth, engineSeconds: defaults.seconds }, (data) => {
          resolve({ depth: clampDepth(data.engineDepth), seconds: clampSeconds(data.engineSeconds) });
        });
      } else {
        resolve({ depth: defaults.depth, seconds: defaults.seconds });
      }
    });
  }

  function saveSettings(depth, seconds) {
    const d = clampDepth(depth);
    const s = clampSeconds(seconds);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ engineDepth: d, engineSeconds: s });
    }
    return { depth: d, seconds: s };
  }

  function applySettings() {
    const depthInput = document.getElementById('engineDepth');
    const secondsInput = document.getElementById('engineSeconds');
    const statusMessage = document.getElementById('statusMessage');
    const button = document.getElementById('saveSettings');

    readSettings().then((settings) => {
      depthInput.value = settings.depth;
      secondsInput.value = settings.seconds;
    });

    button.addEventListener('click', () => {
      const settings = saveSettings(depthInput.value, secondsInput.value);
      if (statusMessage) {
        statusMessage.textContent = `Depth ${settings.depth}, Seconds ${settings.seconds}`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySettings);
  } else {
    applySettings();
  }
})();
