import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface ConfirmHandle {
  open: (opts: { title: string; phrase: string; onConfirm: () => void }) => void;
}

const ConfirmDialog = forwardRef<ConfirmHandle>((props, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('Confirm');
  const [phrase, setPhrase] = useState('');
  const [input, setInput] = useState('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  useImperativeHandle(ref, () => ({
    open: ({ title, phrase, onConfirm }) => {
      setTitle(title);
      setPhrase(phrase);
      setInput('');
      setOnConfirm(() => onConfirm);
      dialogRef.current?.showModal();
    },
  }));

  const close = () => dialogRef.current?.close();
  const confirm = () => { onConfirm(); close(); };
  const matches = input === phrase;

  return (
    <dialog className="modal" ref={dialogRef} onCancel={(e) => { e.preventDefault(); close(); }}>
      <form method="dialog" className="confirm-form" onSubmit={(e) => { e.preventDefault(); if (matches) confirm(); }}>
        <h4>{title}</h4>
        <p>Type the exact phrase to confirm:</p>
        <pre className="confirm-phrase">{phrase}</pre>
        <input aria-label="Confirm phrase" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type exact phrase" />
        {!matches && input && <p className="error">Phrase must match exactly.</p>}
        <div className="modal-actions">
          <button className="btn" type="button" onClick={close}>Cancel</button>
          <button className="btn danger" type="submit" disabled={!matches}>Confirm</button>
        </div>
      </form>
    </dialog>
  );
});

export default ConfirmDialog;

