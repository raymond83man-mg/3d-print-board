import React, { useEffect, useRef, useState } from 'react';
import { getSyncConfig, setSyncConfig, syncDownload, syncUpload } from '../utils/sync';

interface Props { open: boolean; onClose: () => void }

const Settings: React.FC<Props> = ({ open, onClose }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [token, setToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState<'up'|'down'|null>(null);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    if (open) {
      const cfg = getSyncConfig();
      setToken(cfg.token || '');
      setGistId(cfg.gistId || '');
      setAuto(cfg.auto);
      ref.current?.showModal();
    } else ref.current?.close();
  }, [open]);

  const saveCfg = () => { setSyncConfig({ token: token || null, gistId: gistId || null, auto }); };

  const doUpload = async () => {
    setBusy('up'); setError(null);
    try { saveCfg(); await syncUpload(); } catch (e:any) { setError(e.message || String(e)); }
    setBusy(null);
  };
  const doDownload = async () => {
    setBusy('down'); setError(null);
    try { saveCfg(); await syncDownload(); } catch (e:any) { setError(e.message || String(e)); }
    setBusy(null);
  };

  return (
    <dialog className="modal" ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <div className="editor-form">
        <h4>Settings & Sync</h4>
        <p className="hint">GitHub Gist Sync stores your token locally on this device.</p>
        <label>GitHub Personal Access Token (gist scope)
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_..." />
        </label>
        <label>Gist ID (optional; will be created if empty)
          <input value={gistId} onChange={(e) => setGistId(e.target.value)} placeholder="e.g., a1b2c3d4..." />
        </label>
        <label style={{flexDirection:'row',alignItems:'center',gap:8}}>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          <span>Auto-sync on changes (upload)</span>
        </label>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn" onClick={() => { saveCfg(); onClose(); }}>Close</button>
          <button className="btn" disabled={busy!==null} onClick={doDownload}>{busy==='down'?'Loading...':'Load from Cloud'}</button>
          <button className="btn" disabled={busy!==null} onClick={doUpload}>{busy==='up'?'Uploading...':'Sync Now (Upload)'}</button>
        </div>
      </div>
    </dialog>
  );
};

export default Settings;

