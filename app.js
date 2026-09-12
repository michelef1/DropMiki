const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const peersInfo = document.getElementById('peers-info');
const peersList = document.getElementById('peers-list');

function updateStatus(online) {
  if (online) {
    statusBadge.textContent = 'Online';
    statusBadge.style.background = 'rgba(255,255,255,0.25)';
    statusText.textContent = 'Sei online. Quando implementeremo WebRTC, vedrai qui i dispositivi vicini.';
    peersInfo.textContent = 'Nessun dispositivo rilevato (WebRTC non ancora attivo).';
  } else {
    statusBadge.textContent = 'Offline';
    statusBadge.style.background = 'rgba(255,255,255,0.15)';
    statusText.textContent = 'Sei offline. L’app è comunque utilizzabile, ma non può connettersi ad altri dispositivi.';
    peersInfo.textContent = 'Nessun dispositivo rilevato (sei offline).';
  }
}

function init() {
  const online = navigator.onLine;
  updateStatus(online);

  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('[DropMiki] Service Worker registrato');
      })
      .catch((err) => {
        console.error('[DropMiki] Errore registrazione SW:', err);
      });
  }

  // Prompt install (opzionale, per Chrome/Edge)
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // In futuro potrai mostrare un bottone "Installa DropMiki"
  });
}

init();