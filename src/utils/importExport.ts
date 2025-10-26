import { useAppStore } from '../state/store';

export function exportJson() {
  const s = useAppStore.getState();
  const data = {
    schemaVersion: s.schemaVersion,
    tabs: s.tabs,
    activeTab: s.activeTab,
    ui: s.ui,
    cardUi: s.cardUi,
    filterQuery: s.filterQuery,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '3d-print-board.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importJson() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateShape(parsed);
      const totalCards = Object.values(parsed.tabs).reduce((acc: number, t: any) => acc + Object.keys(t.cards || {}).length, 0);
      if (!confirm(`Import will replace current boards. Tabs: ${Object.keys(parsed.tabs).length}, Cards: ${totalCards}. Continue?`)) return;
      useAppStore.setState(parsed);
    } catch (e: any) {
      alert(`Import failed: ${e.message || e}`);
    }
  };
  input.click();
}

function validateShape(data: any) {
  if (typeof data !== 'object' || !data) throw new Error('Invalid JSON');
  if (!data.tabs || typeof data.tabs !== 'object') throw new Error('Missing tabs');
  const tabs = ['personal','work','others'];
  for (const t of tabs) {
    if (!data.tabs[t]) throw new Error(`Missing tab: ${t}`);
    const tab = data.tabs[t];
    if (!tab.columns || !tab.cards) throw new Error(`Invalid tab structure: ${t}`);
  }
}
