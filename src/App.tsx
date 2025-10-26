import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import Board from './components/Board';
import Toolbar from './components/Toolbar';
import QuickGuide from './components/QuickGuide';
import TabSwitcher from './components/TabSwitcher';
import { useAppStore } from './state/store';
import { saveStateSubscribe } from './utils/persistence';
import { selectActiveTab, selectShowQuickGuide } from './state/selectors';
import DragPreviewCard from './components/DragPreviewCard';

function App() {
  const activeTab = useAppStore(selectActiveTab);
  const showQuickGuide = useAppStore(selectShowQuickGuide);
  const setDragging = useAppStore((s) => s.setDragging);
  const onDragEndMove = useAppStore((s) => s.onDragEndMove);
  const setSearchFocusRequest = useAppStore((s) => s.setSearchFocusRequest);
  const addItemToCurrentColumn = useAppStore((s) => s.addItemToCurrentColumn);
  const moveSelectedCard = useAppStore((s) => s.moveSelectedCard);
  const toggleSelectedNotes = useAppStore((s) => s.toggleSelectedNotes);
  const setSelectedCardByDom = useAppStore((s) => s.setSelectedCardByDom);

  const appRef = useRef<HTMLDivElement>(null);
  const [dragInfo, setDragInfo] = useState<{ tab: any; id: string } | null>(null);

  useEffect(() => {
    const unsub = saveStateSubscribe(useAppStore);
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === '/') {
        e.preventDefault();
        setSearchFocusRequest(Date.now());
      } else if (e.key === 'n') {
        e.preventDefault();
        addItemToCurrentColumn();
      } else if (e.key === '[') {
        e.preventDefault();
        moveSelectedCard(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        moveSelectedCard(1);
      } else if ((e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSelectedNotes();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addItemToCurrentColumn, moveSelectedCard, setSearchFocusRequest, toggleSelectedNotes]);

  const onDragStart = (e: DragStartEvent) => {
    setDragging(true);
    if (e.active?.data?.current?.cardId) {
      setSelectedCardByDom(e.active?.data?.current?.cardId);
    }
    if (e.active?.data?.current?.cardId && e.active?.data?.current?.tab) {
      setDragInfo({ tab: e.active.data.current.tab, id: e.active.data.current.cardId });
    }
  };
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(false);
    onDragEndMove(e);
    setDragInfo(null);
  };

  return (
    <div className="app" ref={appRef}>
      <header className="toolbar-wrap">
        <TabSwitcher />
        <Toolbar appRef={appRef} />
      </header>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Board />
        <DragOverlay dropAnimation={{ duration: 150 }}>
          {dragInfo ? (
            <DragPreviewCard tabId={dragInfo.tab} id={dragInfo.id} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {showQuickGuide && <QuickGuide />}
    </div>
  );
}

export default App;
