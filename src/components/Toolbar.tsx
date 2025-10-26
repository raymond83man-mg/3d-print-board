import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../state/store';
import ConfirmDialog from './ConfirmDialog';
import { exportJson, importJson } from '../utils/importExport';
import { snapshotBoard } from '../utils/snapshot';
import ActionsMenu from './ActionsMenu';
import Settings from './Settings';

interface Props { appRef: React.RefObject<HTMLDivElement> }

const Toolbar: React.FC<Props> = ({ appRef }) => {
  const activeTab = useAppStore(s => s.activeTab);
  const filterQuery = useAppStore(s => s.filterQuery);
  const setFilterQuery = useAppStore(s => s.setFilterQuery);
  const searchFocusRequest = useAppStore(s => s.ui.searchFocusRequest);
  const toggleQuickGuide = useAppStore(s => s.toggleQuickGuide);
  const toggleGlobalDetails = useAppStore(s => s.toggleGlobalDetails);
  const showDetails = useAppStore(s => s.ui.showDetails);
  const wipeDone = useAppStore(s => s.wipeDone);
  const wipeTab = useAppStore(s => s.wipeTab);
  const wipeAll = useAppStore(s => s.wipeAll);

  const searchRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<{ open: (opts: { title: string, phrase: string, onConfirm: () => void }) => void }>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  React.useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener('open-settings', handler);
    return () => window.removeEventListener('open-settings', handler);
  }, []);

  useEffect(() => {
    if (!searchFocusRequest) return;
    searchRef.current?.focus();
    searchRef.current?.select();
  }, [searchFocusRequest]);

  const openWipeDone = () => confirmRef.current?.open({
    title: 'Wipe Done', phrase: 'CONFIRM WIPE DONE', onConfirm: wipeDone,
  });
  const openWipeTab = () => {
    const tab = activeTab === 'all' ? 'personal' : activeTab;
    const phrase = `CONFIRM WIPE ${String(tab).toUpperCase()}`;
    confirmRef.current?.open({ title: `Wipe ${String(tab).charAt(0).toUpperCase() + String(tab).slice(1)} board`, phrase, onConfirm: () => wipeTab(tab as any) });
  };
  const openWipeAll = () => confirmRef.current?.open({ title: 'Wipe all boards', phrase: 'CONFIRM WIPE ALL', onConfirm: wipeAll });

  const onSnapshotBoard = async (hideDetails: boolean) => {
    await snapshotBoard({ mode: 'board', hideDetails, element: document.getElementById('board-capture')! });
  };
  const onSnapshotTab = async () => {
    const tab = activeTab === 'all' ? 'personal' : activeTab;
    const el = document.querySelector(`.board .tab-${tab}`) as HTMLElement | null;
    await snapshotBoard({ mode: 'tab', element: el });
  };

  return (
    <div className="toolbar">
      <input
        ref={searchRef}
        className="search"
        placeholder="Search (/ to focus)"
        value={filterQuery}
        onChange={(e) => setFilterQuery(e.target.value)}
        aria-label="Search"
      />
      <button className="btn actions-menu-btn" onClick={() => setMenuOpen(true)} title="Actions">⋯ Actions</button>
      <div className="toolbar-actions">
        <button className="btn" onClick={() => useAppStore.getState().addItemToCurrentColumn()}>Add Item</button>
        <button className="btn" onClick={() => onSnapshotBoard(false)}>Snapshot board</button>
        <button className="btn" onClick={onSnapshotTab}>Snapshot tab</button>
        <button className="btn" onClick={() => onSnapshotBoard(true)}>Snapshot board without details</button>
        <button className="btn" onClick={toggleQuickGuide}>Show Quick Guide</button>
        <button className="btn" onClick={() => importJson()}>Import JSON</button>
        <button className="btn" onClick={() => exportJson()}>Export JSON</button>
        <button className="btn warn" onClick={openWipeDone}>Wipe Done</button>
        <button className="btn warn" onClick={openWipeTab}>Wipe current tab</button>
        <button className="btn danger" onClick={openWipeAll}>Wipe all</button>
        <button className="btn" onClick={toggleGlobalDetails}>{showDetails ? 'Hide details' : 'Show details'}</button>
      </div>
      <ConfirmDialog ref={confirmRef} />
      <ActionsMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={{
          addItem: () => useAppStore.getState().addItemToCurrentColumn(),
          snapshotBoard: () => onSnapshotBoard(false),
          snapshotTab: onSnapshotTab,
          snapshotNoDetails: () => onSnapshotBoard(true),
          quickGuide: toggleQuickGuide,
          importJson: () => importJson(),
          exportJson: () => exportJson(),
          wipeDone: openWipeDone,
          wipeTab: openWipeTab,
          wipeAll: openWipeAll,
          toggleDetails: toggleGlobalDetails,
          showDetails,
        }}
      />
      <button className="btn" style={{display:'none'}} />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Toolbar;
