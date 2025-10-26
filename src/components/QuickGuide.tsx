import React from 'react';
import { useAppStore } from '../state/store';

const QuickGuide: React.FC = () => {
  const toggleQuickGuide = useAppStore(s => s.toggleQuickGuide);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Quick Guide">
      <div className="overlay-content">
        <h3>Quick Guide</h3>
        <ul>
          <li>Columns: Backlog → Priority → To Print → In Progress → Done</li>
          <li>Add/Move: drag-and-drop or use [ ] keys</li>
          <li>Priorities: use *, **, *** in the title</li>
          <li>Snapshot: Board / Tab / Without details</li>
          <li>Wipe phrases:
            <div className="phrases">
              <code>CONFIRM WIPE DONE</code>
              <code>CONFIRM WIPE PERSONAL</code>
              <code>CONFIRM WIPE WORK</code>
              <code>CONFIRM WIPE OTHERS</code>
              <code>CONFIRM WIPE ALL</code>
            </div>
          </li>
          <li>Shortcuts: n, [, ], Ctrl/Cmd+Enter, /</li>
        </ul>
        <div className="modal-actions">
          <button className="btn" onClick={toggleQuickGuide}>Hide Quick Guide</button>
        </div>
      </div>
    </div>
  );
};

export default QuickGuide;
