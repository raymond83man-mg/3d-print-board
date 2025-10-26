import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { parsePriorityFromTitle, nowIso, newId } from '../utils/format';
import { initialState, columnsOrder, defaultColumns, migrateState, emptyTab } from '../utils/persistence';

export type TabId = 'personal' | 'work' | 'others';
export type ColumnId = 'backlog' | 'priority' | 'toPrint' | 'inProgress' | 'done';

export interface Card {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3;
  materials?: string;
  estPrintTime?: string;
  deadline?: string;
  notes?: string;
  whoFor?: string; // Only used in Others tab
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  cardOrder: string[];
}

export interface TabBoard {
  id: TabId;
  title: string;
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
}

export interface AppState {
  tabs: Record<TabId, TabBoard>;
  activeTab: TabId | 'all';
  filterQuery: string;
  ui: {
    showQuickGuide: boolean;
    showDetails: boolean;
    isDragging: boolean;
    searchFocusRequest: number | null;
  };
  cardUi: Record<string, { details?: boolean; editingNotes?: boolean }>; // per-card UI overrides
  schemaVersion: number;

  // actions
  setActiveTab: (tab: AppState['activeTab']) => void;
  setFilterQuery: (q: string) => void;
  setSearchFocusRequest: (t: number) => void;
  toggleQuickGuide: () => void;
  toggleGlobalDetails: () => void;
  setDragging: (v: boolean) => void;

  addCard: (tab: TabId, column: ColumnId, title?: string) => void;
  addItemToCurrentColumn: () => void;
  updateCard: (tab: TabId, id: string, patch: Partial<Card>) => void;
  duplicateCard: (tab: TabId, id: string) => void;
  deleteCard: (tab: TabId, id: string) => void;
  moveCardWithin: (tab: TabId, column: ColumnId, fromIndex: number, toIndex: number) => void;
  moveCardTo: (fromTab: TabId, toTab: TabId, fromColumn: ColumnId, toColumn: ColumnId, cardId: string, toIndex?: number) => void;
  setCardDetailsOverride: (id: string, v: boolean | undefined) => void;
  toggleSelectedNotes: () => void;

  // selected tracking
  selectedCardId: string | null;
  selectedCardTab: TabId | null;
  setSelectedCard: (tab: TabId | null, id: string | null) => void;
  setSelectedCardByDom: (id: string) => void;
  moveSelectedCard: (dir: -1 | 1) => void; // keyboard [ ]

  // drag-end handler bridging
  onDragEndMove: (e: any) => void;

  // wipes
  wipeDone: () => void;
  wipeTab: (tab: TabId) => void;
  wipeAll: () => void;
}

export const useAppStore = create<AppState>()(devtools((set, get) => ({
  ...migrateState(initialState()),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterQuery: (q) => set({ filterQuery: q }),
  setSearchFocusRequest: (t) => set((s) => ({ ui: { ...s.ui, searchFocusRequest: t } })),
  toggleQuickGuide: () => set((s) => ({ ui: { ...s.ui, showQuickGuide: !s.ui.showQuickGuide } })),
  toggleGlobalDetails: () => set((s) => ({ ui: { ...s.ui, showDetails: !s.ui.showDetails } })),
  setDragging: (v) => set((s) => ({ ui: { ...s.ui, isDragging: v } })),

  addCard: (tab, column, title = '') => set((s) => {
    const id = newId();
    const pr = parsePriorityFromTitle(title);
    const card: Card = {
      id,
      title,
      priority: pr,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const tb = s.tabs[tab];
    tb.cards[id] = card;
    tb.columns[column].cardOrder.push(id);
    return { tabs: { ...s.tabs, [tab]: { ...tb, cards: { ...tb.cards }, columns: { ...tb.columns } } }, selectedCardId: id, selectedCardTab: tab };
  }),

  addItemToCurrentColumn: () => {
    const s = get();
    let tab = s.activeTab === 'all' ? 'personal' : s.activeTab; // fallback
    let col: ColumnId = 'backlog';
    if (s.selectedCardId && s.selectedCardTab) {
      tab = s.selectedCardTab;
      const tb = s.tabs[tab];
      for (const cid of columnsOrder) {
        if (tb.columns[cid].cardOrder.includes(s.selectedCardId)) { col = cid; break; }
      }
    }
    s.addCard(tab, col, '');
  },

  updateCard: (tab, id, patch) => set((s) => {
    const tb = s.tabs[tab];
    const cur = tb.cards[id];
    if (!cur) return {} as any;
    const title = patch.title ?? cur.title;
    const priority = patch.title ? parsePriorityFromTitle(patch.title) : (patch.priority ?? cur.priority);
    const next: Card = { ...cur, ...patch, title, priority, updatedAt: nowIso() };
    tb.cards[id] = next;
    return { tabs: { ...s.tabs, [tab]: { ...tb, cards: { ...tb.cards } } } };
  }),

  duplicateCard: (tab, id) => set((s) => {
    const tb = s.tabs[tab];
    const src = tb.cards[id];
    if (!src) return {} as any;
    const nid = newId();
    const copy: Card = { ...src, id: nid, createdAt: nowIso(), updatedAt: nowIso() };
    tb.cards[nid] = copy;
    // place after the original
    const colId = (Object.keys(tb.columns) as ColumnId[]).find((cid) => tb.columns[cid as ColumnId].cardOrder.includes(id)) as ColumnId;
    const col = tb.columns[colId];
    const idx = col.cardOrder.indexOf(id);
    col.cardOrder.splice(idx + 1, 0, nid);
    return { tabs: { ...s.tabs, [tab]: { ...tb, cards: { ...tb.cards }, columns: { ...tb.columns } } } };
  }),

  deleteCard: (tab, id) => set((s) => {
    const tb = s.tabs[tab];
    for (const cid of Object.keys(tb.columns) as ColumnId[]) {
      const col = tb.columns[cid];
      const idx = col.cardOrder.indexOf(id);
      if (idx >= 0) col.cardOrder.splice(idx, 1);
    }
    delete tb.cards[id];
    const sel = s.selectedCardId === id ? { selectedCardId: null, selectedCardTab: null } : {};
    return { tabs: { ...s.tabs, [tab]: { ...tb, cards: { ...tb.cards }, columns: { ...tb.columns } } }, ...sel };
  }),

  moveCardWithin: (tab, column, fromIndex, toIndex) => set((s) => {
    const tb = s.tabs[tab];
    const col = tb.columns[column];
    col.cardOrder = arrayMove(col.cardOrder, fromIndex, toIndex);
    return { tabs: { ...s.tabs, [tab]: { ...tb, columns: { ...tb.columns, [column]: { ...col } } } } };
  }),

  moveCardTo: (fromTab, toTab, fromColumn, toColumn, cardId, toIndex) => set((s) => {
    const ft = s.tabs[fromTab];
    const tt = s.tabs[toTab];
    // remove from source
    const srcCol = ft.columns[fromColumn];
    const idx = srcCol.cardOrder.indexOf(cardId);
    if (idx >= 0) srcCol.cardOrder.splice(idx, 1);
    // add to target
    const tgtCol = tt.columns[toColumn];
    if (toIndex == null || toIndex < 0 || toIndex > tgtCol.cardOrder.length) tgtCol.cardOrder.push(cardId);
    else tgtCol.cardOrder.splice(toIndex, 0, cardId);
    // if cross-tab, move card data too
    if (fromTab !== toTab) {
      tt.cards[cardId] = ft.cards[cardId];
      delete ft.cards[cardId];
    }
    return { tabs: { ...s.tabs, [fromTab]: { ...ft }, [toTab]: { ...tt } }, selectedCardId: cardId, selectedCardTab: toTab };
  }),

  setCardDetailsOverride: (id, v) => set((s) => ({ cardUi: { ...s.cardUi, [id]: { ...(s.cardUi[id] || {}), details: v } } })),

  selectedCardId: null,
  selectedCardTab: null,
  setSelectedCard: (tab, id) => set({ selectedCardId: id, selectedCardTab: tab }),
  setSelectedCardByDom: (id) => set((s) => ({ selectedCardId: id, selectedCardTab: (['personal', 'work', 'others'] as TabId[]).find(t => Object.values(s.tabs[t].cards).some(c => c.id === id)) || s.selectedCardTab })),
  moveSelectedCard: (dir) => set((s) => {
    const id = s.selectedCardId; const tab = s.selectedCardTab;
    if (!id || !tab) return {} as any;
    const tb = s.tabs[tab];
    let fromCol: ColumnId | null = null;
    for (const cid of columnsOrder) {
      if (tb.columns[cid].cardOrder.includes(id)) { fromCol = cid; break; }
    }
    if (!fromCol) return {} as any;
    const idx = columnsOrder.indexOf(fromCol);
    const toIdx = idx + dir;
    if (toIdx < 0 || toIdx >= columnsOrder.length) return {} as any;
    const toCol = columnsOrder[toIdx];
    // remove from current, push to end of next column
    const src = tb.columns[fromCol];
    const pos = src.cardOrder.indexOf(id);
    if (pos >= 0) src.cardOrder.splice(pos, 1);
    tb.columns[toCol].cardOrder.push(id);
    return { tabs: { ...s.tabs, [tab]: { ...tb } } };
  }),

  toggleSelectedNotes: () => set((s) => {
    const id = s.selectedCardId; if (!id) return {} as any;
    const cur = s.cardUi[id]?.editingNotes || false;
    return { cardUi: { ...s.cardUi, [id]: { ...(s.cardUi[id] || {}), editingNotes: !cur } } };
  }),

  onDragEndMove: (e) => {
    const overId: string | undefined = e.over?.id;
    const activeId: string | undefined = e.active?.id;
    if (!overId || !activeId) return;
    const data = e.active.data.current as { tab: TabId; column: ColumnId; index: number; cardId: string };
    const overData = e.over.data.current as { tab?: TabId; column?: ColumnId; index?: number };
    if (!data) return;
    const fromTab = data.tab; const fromCol = data.column; const fromIndex = data.index;
    const toTab = overData?.tab ?? fromTab;
    const toCol = overData?.column ?? fromCol;

    if (fromTab === toTab && fromCol === toCol) {
      // reorder within column
      const s = get();
      const tb = s.tabs[fromTab];
      const list = tb.columns[fromCol].cardOrder;
      const oldIndex = fromIndex;
      const newIndex = overData?.index ?? oldIndex;
      if (oldIndex !== newIndex) get().moveCardWithin(fromTab, fromCol, oldIndex, newIndex);
    } else {
      get().moveCardTo(fromTab, toTab, fromCol, toCol, data.cardId, overData?.index);
    }
  },

  wipeDone: () => set((s) => {
    const tabs = { ...s.tabs };
    (['personal','work','others'] as TabId[]).forEach((t) => {
      const tb = tabs[t];
      const doneCol = tb.columns['done'];
      doneCol.cardOrder.forEach(id => { delete tb.cards[id]; });
      doneCol.cardOrder = [];
    });
    return { tabs };
  }),

  wipeTab: (tab) => set((s) => {
    const tabs = { ...s.tabs, [tab]: emptyTab(tab) };
    return { tabs };
  }),

  wipeAll: () => set(() => migrateState(initialState())),
})));
