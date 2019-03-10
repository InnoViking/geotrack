const butToggle = document.getElementById('butToggle');
const wlActive = document.getElementById('wlActive');
const wlType = document.getElementById('wlType');
const wlDuration = document.getElementById('wlDuration');
let wakeLock;
let wakeLockRequest;
let wakeLockStart;
document.getElementById('wlKind').textContent = wlKind;

/**
 * Get WakeLock, then update the page and add event listeners
 */
async function initWakeLock() {
  try {
    wakeLock = await navigator.getWakeLock(wlKind);
    console.log(`${wlKind} wakeLock created`, wakeLock);
    butToggle.removeAttribute('disabled');
    updateStatus();
    // Listen for changes to the wakeLock
    wakeLock.addEventListener('activechange', (e) => {
      updateStatus();
    });
    // If search query includes 'autostart', start the Wake Lock
    if (window.location.search.includes('autostart')) {
      toggleWakeLock();
    }
  } catch (ex) {
    wlActive.textContent = ex.message;
    console.error(`getWakeLock('${wlKind}') failed`, ex);
  }
}

// Check if Wake Lock is available, if so, set it up.
if ('getWakeLock' in navigator) {
  console.log('👍', 'navigator.getWakeLock is supported');
  initWakeLock();
} else {
  console.warn('👎', 'navigator.getWakeLock is not supported');
  document.getElementById('notSupported').classList.toggle('hidden', false);
  document.getElementById('status').classList.toggle('hidden', true); 
}

/**
 * Toggle button event handler
 */
butToggle.addEventListener('click', (e) => {
  toggleWakeLock();
});

function toggleWakeLock() {
  if (wakeLockRequest) {
    wakeLockRequest.cancel();
    wakeLockRequest = null;
    return;
  }
  wakeLockRequest = wakeLock.createRequest();
  wlDuration.textContent = '0';
}

/**
 * Update the stats on the page
 */
function updateStatus() {
  console.log('updatetatus', wakeLock.active);
  wlActive.textContent = wakeLock.active;
  wlType.textContent = wakeLock.type;
  butToggle.textContent = wakeLock.active ? 'Stop' : 'Start';
  if (wakeLock.active) {
    wakeLockStart = Date.now();
  } else {
    wakeLockStart = 0;
  }
}

/**
 * Update the duration of the wakelock
 */
setInterval(() => {
  if (wakeLockStart) {
    const duration = Math.round((Date.now() - wakeLockStart) / 1000);
    wlDuration.textContent = duration;
  }
}, 1000);


/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
if (window.location.protocol === 'http:') {
  const requireHTTPS = document.getElementById('requireHTTPS');
  const link = requireHTTPS.querySelector('a');
  link.href = window.location.href.replace('http://', 'https://');
  requireHTTPS.classList.remove('hidden');
}
