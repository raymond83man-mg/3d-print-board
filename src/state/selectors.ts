import { AppState, TabId } from './store';

export const selectActiveTab = (s: AppState) => s.activeTab;
export const selectShowQuickGuide = (s: AppState) => s.ui.showQuickGuide;
export const selectFilterQuery = (s: AppState) => s.filterQuery;

export const selectTab = (tab: TabId) => (s: AppState) => s.tabs[tab];
export const selectTabs = (s: AppState) => s.tabs;
