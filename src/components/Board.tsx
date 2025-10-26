import React, { useMemo } from 'react';
import { useAppStore } from '../state/store';
import Column from './Column';
import { selectActiveTab } from '../state/selectors';

const Board: React.FC = () => {
  const activeTab = useAppStore(selectActiveTab);
  const tabs = useAppStore(s => s.tabs);

  const visibleTabs = useMemo(() => {
    if (activeTab === 'all') return ['personal', 'work', 'others'] as const;
    return [activeTab];
  }, [activeTab]);

  return (
    <div className={`board ${activeTab === 'all' ? 'board-all' : 'board-single'}`} id="board-capture">
      {visibleTabs.map((tid) => {
        const t = tabs[tid];
        return (
          <section className={`tab-panel tab-${tid}`} key={tid} aria-label={t.title}>
            <header className="tab-header" role="heading" aria-level={2}>
              <h2>{t.title}</h2>
            </header>
            <div className="columns">
              {(['backlog','priority','toPrint','inProgress','done'] as const).map(cid => (
                <Column key={`${tid}-${cid}`} tabId={tid} columnId={cid} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Board;
