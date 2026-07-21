import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  kanbanView: 'board' | 'table';
  setSidebarOpen: (open: boolean) => void;
  setKanbanView: (view: 'board' | 'table') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  kanbanView: 'board',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setKanbanView: (view) => set({ kanbanView: view }),
}));
