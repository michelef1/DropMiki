const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const myIdInput = document.getElementById('my-id');
const copyIdBtn = document.getElementById('copy-id-btn');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const connStatus = document.getElementById('conn-status');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

let peer = null;
let conn = null;

function updateStatus(online) {
  if (online) {
    statusBadge.textContent = 'Online';
    statusBadge.style.background = 'rgba(255,255,255,0.25)';
    statusText.textContent = 'Sei online. Condividi il tuo ID con un altro dispositivo per connetterti.';
  } else {
    statusBadge.textContent = 'Offline';
    statusBadge.style.background = 'rgba(255,255,255,0.15)';
    statusText.textContent = 'Sei offline. L’app è caricata, ma non può connettersi ad altri dispositivi.';
  }
}

function appendMessage(text, fromMe = true) {
  if (chatBox.querySelector('p')) {
    const p = chatBox.querySelector('p');
    if (p.textContent.includes('appariranno')) {
      chatBox.innerHTML = '';
    }
  }
  const div = document.createElement('div');
  div.style.marginBottom = '6px';
  div.style.fontSize = '0.9rem';
  div.style.wordBreak = 'break-word';
  div.textContent = (fromMe ? 'Tu: ' : 'Peer: ') + text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function initPeer() {
  peer = new Peer(null, {
    debug: 2
  });

  peer.on('open', (id) => {
    myIdInput.value = id;
    console.log('[DropMiki] Mio ID:', id);
  });

  peer.on('connection', (c) => {
    if (conn && conn.open) {
      c.close();
      return;
    }
    conn = c;
    setupConnection();
    connStatus.textContent = 'Connesso a: ' + conn.peer;
  });

  peer.on('error', (err) => {
    console.error('[DropMiki] Errore PeerJS:', err);
    connStatus.textContent = 'Errore: ' + err.type;
  });
}

function connectToPeer(peerId) {
  if (!peer) {
    connStatus.textContent = 'Peer non ancora inizializzato.';
    return;
  }
  if (conn && conn.open) {
    connStatus.textContent = 'Già connesso. Disconnettiti prima se vuoi cambiare peer.';
    return;
  }
  connStatus.textContent = 'Connessione in corso…';
  const c = peer.connect(peerId);
  conn = c;
  setupConnection();
}

function setupConnection() {
  if (!conn) return;

  conn.on('open', () => {
    connStatus.textContent = 'Connesso a: ' + conn.peer;
    appendMessage('(connessione stabilita)', true);
  });

  conn.on('data', (data) => {
    appendMessage(String(data), false);
  });

  conn.on('close', () => {
    connStatus.textContent = 'Connessione chiusa.';
    appendMessage('(peer disconnesso)', true);
    conn = null;
  });

  conn.on('error', (err) => {
    console.error('[DropMiki] Errore connessione:', err);
    connStatus.textContent = 'Errore connessione.';
  });
}

function init() {
  const online = navigator.onLine;
  updateStatus(online);

  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('[DropMiki] Service Worker registrato'))
      .catch((err) => console.error('[DropMiki] Errore SW:', err));
  }

  initPeer();

  copyIdBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(myIdInput.value);
      copyIdBtn.textContent = 'Copiato!';
      setTimeout(() => (copyIdBtn.textContent = 'Copia'), 1200);
    } catch {
      myIdInput.select();
      document.execCommand('copy');
      copyIdBtn.textContent = 'Copiato!';
      setTimeout(() => (copyIdBtn.textContent = 'Copia'), 1200);
    }
  });

  connectBtn.addEventListener('click', () => {
    const id = peerIdInput.value.trim();
    if (!id) {
      connStatus.textContent = 'Inserisci un ID peer.';
      return;
    }
    connectToPeer(id);
  });

  function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    if (!conn || !conn.open) {
      connStatus.textContent = 'Nessuna connessione attiva.';
      return;
    }
    conn.send(text);
    appendMessage(text, true);
    msgInput.value = '';
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

init();