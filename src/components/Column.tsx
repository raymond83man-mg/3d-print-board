import React, { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore, ColumnId, TabId } from '../state/store';
import CardView from './Card';

const titles: Record<ColumnId, string> = {
  backlog: 'Backlog',
  priority: 'Priority',
  toPrint: 'To Print',
  inProgress: 'In Progress',
  done: 'Done',
};

interface Props { tabId: TabId; columnId: ColumnId; }

const Column: React.FC<Props> = ({ tabId, columnId }) => {
  const tab = useAppStore(s => s.tabs[tabId]);
  const q = useAppStore(s => s.filterQuery.trim().toLowerCase());
  const addCard = useAppStore(s => s.addCard);
  const setSelectedCard = useAppStore(s => s.setSelectedCard);
  const [quickTitle, setQuickTitle] = useState('');
  const notesMatch = (s?: string) => (s || '').toLowerCase().includes(q);

  const { setNodeRef } = useDroppable({ id: `${tabId}-${columnId}`, data: { tab: tabId, column: columnId } });

  const items = tab.columns[columnId].cardOrder;
  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter(id => {
      const c = tab.cards[id];
      const hay = `${c.title} ${c.materials || ''} ${c.notes || ''} ${tabId === 'others' ? (c.whoFor || '') : ''}`.toLowerCase();
      return hay.includes(q) || notesMatch(c.estPrintTime) || notesMatch(c.deadline);
    });
  }, [items, tab.cards, q, tabId]);

  const onAdd = () => {
    addCard(tabId, columnId, quickTitle.trim());
    setQuickTitle('');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className={`column column-${columnId}`}>
      <header className="column-header"><h3>{titles[columnId]}</h3></header>
      <div className={`column-body ${filtered.length === 0 ? 'column-empty' : ''}`} ref={setNodeRef}>
        <SortableContext items={filtered} strategy={verticalListSortingStrategy}>
          {filtered.map((id, idx) => (
            <CardView key={id} tabId={tabId} columnId={columnId} id={id} index={idx} />
          ))}
          {filtered.length === 0 && (
            <div className="empty-drop">Drop items here or Add one</div>
          )}
        </SortableContext>
      </div>
      <div className="quick-add">
        <input
          aria-label="Add item"
          placeholder="+ Add item"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setSelectedCard(null, null)}
        />
        <button className="btn" onClick={onAdd}>Add</button>
      </div>
    </div>
  );
};

export default Column;
