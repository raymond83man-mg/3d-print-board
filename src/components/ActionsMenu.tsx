import React, { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  actions: {
    addItem: () => void;
    snapshotBoard: () => Promise<void> | void;
    snapshotTab: () => Promise<void> | void;
    snapshotNoDetails: () => Promise<void> | void;
    quickGuide: () => void;
    importJson: () => void;
    exportJson: () => void;
    wipeDone: () => void;
    wipeTab: () => void;
    wipeAll: () => void;
    toggleDetails: () => void;
    showDetails: boolean;
  };
}

const ActionsMenu: React.FC<Props> = ({ open, onClose, actions }) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) ref.current?.showModal(); else ref.current?.close(); }, [open]);
  return (
    <dialog className="modal" ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <div className="editor-form">
        <h4>Actions</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <button className="btn" onClick={() => { actions.addItem(); onClose(); }}>Add Item</button>
          <button className="btn" onClick={async () => { await actions.snapshotBoard(); onClose(); }}>Snapshot board</button>
          <button className="btn" onClick={async () => { await actions.snapshotTab(); onClose(); }}>Snapshot tab</button>
          <button className="btn" onClick={async () => { await actions.snapshotNoDetails(); onClose(); }}>Snapshot board without details</button>
          <button className="btn" onClick={() => { actions.quickGuide(); onClose(); }}>Show Quick Guide</button>
          <button className="btn" onClick={() => { actions.importJson(); onClose(); }}>Import JSON</button>
          <button className="btn" onClick={() => { actions.exportJson(); onClose(); }}>Export JSON</button>
          <button className="btn" onClick={() => { actions.toggleDetails(); onClose(); }}>{actions.showDetails ? 'Hide details' : 'Show details'}</button>
          <button className="btn warn" onClick={() => { actions.wipeDone(); onClose(); }}>Wipe Done</button>
          <button className="btn warn" onClick={() => { actions.wipeTab(); onClose(); }}>Wipe current tab</button>
          <button className="btn danger" onClick={() => { actions.wipeAll(); onClose(); }}>Wipe all</button>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  );
};

export default ActionsMenu;

