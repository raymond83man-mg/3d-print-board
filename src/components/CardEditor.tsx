import React, { useEffect, useRef, useState } from 'react';
import { TabId, useAppStore } from '../state/store';

interface Props {
  id: string;
  tabId: TabId;
  open: boolean;
  onClose: () => void;
}

const CardEditor: React.FC<Props> = ({ id, tabId, open, onClose }) => {
  const card = useAppStore(s => s.tabs[tabId].cards[id]);
  const updateCard = useAppStore(s => s.updateCard);
  const ref = useRef<HTMLDialogElement>(null);
  const [local, setLocal] = useState({
    title: card?.title || '',
    materials: card?.materials || '',
    estPrintTime: card?.estPrintTime || '',
    deadline: card?.deadline || '',
    notes: card?.notes || '',
    whoFor: card?.whoFor || '',
  });

  useEffect(() => {
    if (open) ref.current?.showModal(); else ref.current?.close();
  }, [open]);

  useEffect(() => {
    setLocal({
      title: card?.title || '',
      materials: card?.materials || '',
      estPrintTime: card?.estPrintTime || '',
      deadline: card?.deadline || '',
      notes: card?.notes || '',
      whoFor: card?.whoFor || '',
    });
  }, [id, tabId]);

  const save = () => {
    updateCard(tabId, id, {
      title: local.title,
      materials: local.materials || undefined,
      estPrintTime: local.estPrintTime || undefined,
      deadline: local.deadline || undefined,
      notes: local.notes || undefined,
      whoFor: tabId === 'others' ? (local.whoFor || undefined) : undefined,
    });
    onClose();
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if ((e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      save();
    }
  };

  return (
    <dialog className="modal" ref={ref} onKeyDown={onKeyDown} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <form method="dialog" className="editor-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <h4>Edit Card</h4>
        <label>Title
          <input value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} required />
        </label>
        <label>Materials
          <input value={local.materials} onChange={(e) => setLocal({ ...local, materials: e.target.value })} />
        </label>
        <div className="grid-2">
          <label>Est. Print Time
            <input value={local.estPrintTime} onChange={(e) => setLocal({ ...local, estPrintTime: e.target.value })} placeholder="e.g., 6h 30m" />
          </label>
          <label>Deadline
            <input type="date" value={local.deadline} onChange={(e) => setLocal({ ...local, deadline: e.target.value })} />
          </label>
        </div>
        <label>Notes
          <textarea rows={4} value={local.notes} onChange={(e) => setLocal({ ...local, notes: e.target.value })} />
        </label>
        {tabId === 'others' && (
          <label>Who For
            <input value={local.whoFor} onChange={(e) => setLocal({ ...local, whoFor: e.target.value })} />
          </label>
        )}
        <div className="modal-actions">
          <button className="btn" type="submit">Save</button>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </div>
        <p className="hint">Ctrl/Cmd+Enter to save</p>
      </form>
    </dialog>
  );
};

export default CardEditor;
