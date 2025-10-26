// Simple GitHub Gist sync (client-side only)
// Stores token and gistId in localStorage. Use with caution; token is saved on device.

import { useAppStore } from '../state/store';

const LS_TOKEN = 'sync.gist.token';
const LS_GIST = 'sync.gist.gistId';
const LS_AUTO = 'sync.gist.auto';

export type SyncConfig = {
  token: string | null;
  gistId: string | null;
  auto: boolean;
};

export function getSyncConfig(): SyncConfig {
  return {
    token: localStorage.getItem(LS_TOKEN),
    gistId: localStorage.getItem(LS_GIST),
    auto: localStorage.getItem(LS_AUTO) === 'true',
  };
}

export function setSyncConfig(cfg: Partial<SyncConfig>) {
  const cur = getSyncConfig();
  const next = { ...cur, ...cfg };
  if (cfg.token !== undefined) {
    if (cfg.token) localStorage.setItem(LS_TOKEN, cfg.token); else localStorage.removeItem(LS_TOKEN);
  }
  if (cfg.gistId !== undefined) {
    if (cfg.gistId) localStorage.setItem(LS_GIST, cfg.gistId); else localStorage.removeItem(LS_GIST);
  }
  if (cfg.auto !== undefined) localStorage.setItem(LS_AUTO, String(!!cfg.auto));
  return next;
}

function authHeaders(token: string) {
  return { Authorization: `token ${token}`, 'Content-Type': 'application/json' };
}

async function ensureGist(token: string, gistId: string | null) {
  if (gistId) return gistId;
  const body = {
    description: '3D Print Board sync',
    public: false,
    files: { 'board.json': { content: '{}' } },
  };
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create gist');
  const data = await res.json();
  const id = data.id as string;
  setSyncConfig({ gistId: id });
  return id;
}

export async function syncUpload() {
  const { token, gistId } = getSyncConfig();
  if (!token) throw new Error('No token configured');
  const id = await ensureGist(token, gistId);
  const state = useAppStore.getState();
  const payload = {
    schemaVersion: state.schemaVersion,
    tabs: state.tabs,
    activeTab: state.activeTab,
    ui: state.ui,
    cardUi: state.cardUi,
    filterQuery: state.filterQuery,
  };
  const body = { files: { 'board.json': { content: JSON.stringify(payload) } } };
  const res = await fetch(`https://api.github.com/gists/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Upload failed');
}

export async function syncDownload() {
  const { token, gistId } = getSyncConfig();
  if (!token || !gistId) throw new Error('No token/gist configured');
  const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Download failed');
  const data = await res.json();
  const files = data.files || {};
  const file = files['board.json'];
  const content = file?.content;
  if (!content) throw new Error('No board.json in gist');
  const parsed = JSON.parse(content);
  useAppStore.setState(parsed);
}

let debounceTimer: any;
export function setupAutoSync() {
  const cfg = getSyncConfig();
  if (!cfg.auto || !cfg.token) return () => {};
  const unsub = useAppStore.subscribe(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncUpload().catch(() => {});
    }, 2000);
  });
  return unsub;
}

