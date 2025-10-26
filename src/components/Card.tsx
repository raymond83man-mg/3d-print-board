import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as TCard, ColumnId, TabId, useAppStore } from '../state/store';
import classNames from 'classnames';
import CardEditor from './CardEditor';

interface Props { id: string; tabId: TabId; columnId: ColumnId; index: number }

const priorityBadge = (p: number) => p ? String(p) : '';

const CardView: React.FC<Props> = ({ id, tabId, columnId, index }) => {
  const card = useAppStore(s => s.tabs[tabId].cards[id]);
  const deleteCard = useAppStore(s => s.deleteCard);
  const duplicateCard = useAppStore(s => s.duplicateCard);
  const updateCard = useAppStore(s => s.updateCard);
  const selectedId = useAppStore(s => s.selectedCardId);
  const setSelectedCard = useAppStore(s => s.setSelectedCard);
  const ui = useAppStore(s => s.ui);
  const cardUi = useAppStore(s => s.cardUi[id] || {});
  const setCardDetailsOverride = useAppStore(s => s.setCardDetailsOverride);

  const [deleting, setDeleting] = useState(false);
  const isEditing = useAppStore(s => !!s.cardUi[id]?.editingNotes);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { tab: tabId, column: columnId, index, cardId: id } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedId === id;
  const showDetails = (cardUi.details ?? ui.showDetails);
  const onDelete = () => {
    setDeleting(true);
    setTimeout(() => deleteCard(tabId, id), 220);
  };

  const onToggleDetails = () => setCardDetailsOverride(id, !showDetails);

  const onClickCard = () => setSelectedCard(tabId, id);

  return (
    <article
      className={classNames('card', { 'card-selected': isSelected, 'card-deleting': deleting, 'card-dragging': isDragging })}
      ref={setNodeRef}
      style={style}
      onClick={onClickCard}
      tabIndex={0}
      {...attributes}
      {...listeners}
    >
      <div className="card-head">
        <span className={classNames('priority', `p${card.priority}`)} aria-label={card.priority ? `Priority ${card.priority}` : 'No priority'}>
          {priorityBadge(card.priority)}
        </span>
        <div className="title" role="textbox" aria-label="Title">
          {card.title || <em className="muted">Untitled</em>}
        </div>
        <div className="card-actions">
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); useAppStore.setState(s => ({ cardUi: { ...s.cardUi, [id]: { ...(s.cardUi[id] || {}), editingNotes: true } } })); }}>✎</button>
          <button className="icon-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateCard(tabId, id); }}>⎘</button>
          <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑</button>
        </div>
      </div>
      {showDetails && (
        <div className="card-details">
          {tabId === 'others' && card.whoFor && <div className="row"><strong>Who:</strong> <span>{card.whoFor}</span></div>}
          {card.materials && <div className="row"><strong>Materials:</strong> <span>{card.materials}</span></div>}
          {card.estPrintTime && <div className="row"><strong>Est:</strong> <span>{card.estPrintTime}</span></div>}
          {card.deadline && <div className="row"><strong>Deadline:</strong> <span>{card.deadline}</span></div>}
          {card.notes && <div className="row notes"><strong>Notes:</strong> <span>{card.notes}</span></div>}
        </div>
      )}
      <div className="card-foot">
        <button className="link" onClick={(e) => { e.stopPropagation(); onToggleDetails(); }}>{showDetails ? 'Hide details' : 'Show details'}</button>
      </div>
      <CardEditor id={id} tabId={tabId} open={isEditing} onClose={() => useAppStore.setState(s => ({ cardUi: { ...s.cardUi, [id]: { ...(s.cardUi[id] || {}), editingNotes: false } } }))} />
    </article>
  );
};

export default CardView;
