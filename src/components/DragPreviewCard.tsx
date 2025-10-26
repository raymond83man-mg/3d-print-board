import React from 'react';
import { useAppStore, TabId } from '../state/store';

interface Props { tabId: TabId; id: string }

const DragPreviewCard: React.FC<Props> = ({ tabId, id }) => {
  const card = useAppStore(s => s.tabs[tabId].cards[id]);
  if (!card) return null;
  return (
    <div style={{ pointerEvents: 'none', maxWidth: 360 }}>
      <article className="card card-dragging" style={{ boxShadow: '0 12px 24px rgba(0,0,0,0.12)', transform: 'scale(1.02)' }}>
        <div className="card-head">
          <span className={`priority p${card.priority}`}>{card.priority || ''}</span>
          <div className="title">{card.title || <em className="muted">Untitled</em>}</div>
        </div>
      </article>
    </div>
  );
};

export default DragPreviewCard;

