import React from 'react';
import { useAppStore } from '../state/store';

const TabSwitcher: React.FC = () => {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const isDragging = useAppStore(s => s.ui.isDragging);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'personal', label: 'Personal' },
    { id: 'work', label: 'Work' },
    { id: 'others', label: 'Others' },
  ] as const;

  return (
    <nav className="tab-switcher" aria-label="Tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`tab-btn ${activeTab === t.id ? 'active' : ''} tab-${t.id}`}
          onClick={() => setActiveTab(t.id as any)}
          onMouseEnter={() => { if (isDragging && t.id !== 'all') setActiveTab(t.id as any); }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
};

export default TabSwitcher;
