import type { AppState, Column, ColumnId, TabBoard, TabId } from '@state/store';

export const columnsOrder: ColumnId[] = ['backlog','priority','toPrint','inProgress','done'];

export const defaultColumns: Record<ColumnId, Column> = {
  backlog: { id: 'backlog', title: 'Backlog', cardOrder: [] },
  priority: { id: 'priority', title: 'Priority', cardOrder: [] },
  toPrint: { id: 'toPrint', title: 'To Print', cardOrder: [] },
  inProgress: { id: 'inProgress', title: 'In Progress', cardOrder: [] },
  done: { id: 'done', title: 'Done', cardOrder: [] },
};

export const emptyTab = (id: TabId): TabBoard => ({
  id,
  title: id === 'personal' ? 'Personal' : id === 'work' ? 'Work' : 'Others',
  columns: JSON.parse(JSON.stringify(defaultColumns)),
  cards: {},
});

export function initialState(): AppState {
  const existing = loadState();
  if (existing) return existing;
  return {
    tabs: {
      personal: emptyTab('personal'),
      work: emptyTab('work'),
      others: emptyTab('others'),
    },
    activeTab: 'all',
    filterQuery: '',
    ui: { showQuickGuide: false, showDetails: true, isDragging: false, searchFocusRequest: null },
    cardUi: {},
    schemaVersion: 1,
  };
}

const STORAGE_KEY = '3d-print-board:v1';

export function saveState(state: AppState) {
  try {
    const toSave = { ...state } as AppState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // ignore
  }
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch {
    return null;
  }
}

export function migrateState(s: AppState): AppState {
  // schemaVersion 1 baseline
  if (!s.schemaVersion) s.schemaVersion = 1;
  return s;
}

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let t: any; return (...args: any[]) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function saveStateSubscribe(store: any) {
  const debounced = debounce((s: AppState) => saveState(s), 250);
  return store.subscribe(debounced);
}

