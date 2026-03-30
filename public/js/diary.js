const API_URL = 'http://localhost:3000/api';
let isOnline = navigator.onLine;

const updateSyncStatus = () => {
  const syncEl = document.getElementById('sync-status');
  if (isOnline) {
    syncEl.innerHTML = '🟢 Online';
    syncOfflineData();
  } else {
    syncEl.innerHTML = '🔴 Offline (Saving locally)';
  }
};

window.addEventListener('online', () => { isOnline = true; updateSyncStatus(); });
window.addEventListener('offline', () => { isOnline = false; updateSyncStatus(); });

const loadDiaries = async () => {
  const listEl = document.getElementById('diary-list');
  listEl.innerHTML = 'Loading...';
  
  const user = JSON.parse(localStorage.getItem('mindspace_user'));
  let entries = [];
  
  if (isOnline && user) {
    try {
      const res = await fetch(`${API_URL}/diary/${user._id}`);
      entries = await res.json();
      localStorage.setItem('cached_diaries', JSON.stringify(entries));
    } catch (err) {
      entries = JSON.parse(localStorage.getItem('cached_diaries') || '[]');
    }
  } else {
    entries = JSON.parse(localStorage.getItem('cached_diaries') || '[]');
  }

  const offlineEntries = JSON.parse(localStorage.getItem('offline_diaries') || '[]');
  entries = [...offlineEntries, ...entries].sort((a,b) => new Date(b.date) - new Date(a.date));

  listEl.innerHTML = '';
  if (entries.length === 0) {
    listEl.innerHTML = '<p class="text-muted">No entries yet.</p>';
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement('div');
    div.style.background = 'rgba(255,255,255,0.4)';
    div.style.padding = '10px 15px';
    div.style.marginBottom = '10px';
    div.style.borderRadius = '10px';
    
    const dateStr = new Date(entry.date).toLocaleString();
    div.innerHTML = `
      <h4 style="margin-bottom: 5px">${entry.title}</h4>
      <p style="font-size: 0.95rem; margin-bottom: 5px">${entry.content}</p>
      <small class="text-muted">${dateStr} ${entry._id ? '' : '(Unsynced, will sync when online)'}</small>
    `;
    listEl.appendChild(div);
  });
};

const syncOfflineData = async () => {
  const offlineEntries = JSON.parse(localStorage.getItem('offline_diaries') || '[]');
  const user = JSON.parse(localStorage.getItem('mindspace_user'));
  
  if (offlineEntries.length > 0 && user) {
    try {
      await fetch(`${API_URL}/diary/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, entries: offlineEntries })
      });
      localStorage.removeItem('offline_diaries');
      loadDiaries();
    } catch (err) {
      console.warn('Sync failed', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateSyncStatus();
  // Ensure user is loaded
  setTimeout(loadDiaries, 500);

  document.getElementById('save-diary').addEventListener('click', async () => {
    const title = document.getElementById('diary-title').value || 'Untitled Entry';
    const content = document.getElementById('diary-content').value;
    if (!content) return alert('Content cannot be empty');

    const newEntry = { title, content, date: new Date().toISOString() };
    
    if (isOnline) {
      const user = JSON.parse(localStorage.getItem('mindspace_user'));
      if(user) {
        try {
           await fetch(`${API_URL}/diary/sync`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: user._id, entries: [newEntry] })
           });
           document.getElementById('diary-title').value = '';
           document.getElementById('diary-content').value = '';
           loadDiaries();
        } catch (err) {
           saveLocal(newEntry);
        }
      } else {
        saveLocal(newEntry);
      }
    } else {
      saveLocal(newEntry);
    }
  });

  function saveLocal(entry) {
    const offlineEntries = JSON.parse(localStorage.getItem('offline_diaries') || '[]');
    offlineEntries.push(entry);
    localStorage.setItem('offline_diaries', JSON.stringify(offlineEntries));
    document.getElementById('diary-title').value = '';
    document.getElementById('diary-content').value = '';
    loadDiaries();
  }
});
