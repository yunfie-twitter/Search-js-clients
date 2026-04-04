import { create } from 'zustand';
import { 
  SearchType, 
  ResultMeta, 
  ResultDetail, 
  Pager, 
  createPager,
  getHistory,
  clearHistory,
  removeHistory
} from '@yunfie/search-js';

interface SearchState {
  query: string;
  type: SearchType;
  results: ResultMeta[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  pager: Pager | null;
  selectedItem: ResultDetail | null;
  language: 'ja' | 'en';
  themeMode: 'light' | 'dark' | 'system';
  saveHistory: boolean;
  enableAnimations: boolean;
  page: number;
  
  // Actions
  setQuery: (q: string) => void;
  setType: (t: SearchType) => void;
  setSelectedItem: (item: ResultDetail | null) => void;
  setLanguage: (lang: 'ja' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSaveHistory: (save: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setPage: (p: number) => void;
  
  performSearch: (q: string, type: SearchType, page?: number) => Promise<void>;
  resetSearch: () => void;
}

const STORAGE_KEY = 'wholphin_settings';

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saved = getSavedSettings();

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  type: 'web',
  results: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,
  pager: null,
  selectedItem: null,
  language: saved.language || 'ja',
  themeMode: saved.themeMode || 'system',
  saveHistory: saved.saveHistory !== undefined ? saved.saveHistory : true,
  enableAnimations: saved.enableAnimations !== undefined ? saved.enableAnimations : true,
  page: 1,

  setQuery: (q) => set({ query: q }),
  setType: (t) => set({ type: t }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSavedSettings(), language: lang }));
  },
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSavedSettings(), themeMode: mode }));
  },
  setSaveHistory: (save) => {
    set({ saveHistory: save });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSavedSettings(), saveHistory: save }));
  },
  setEnableAnimations: (enable) => {
    set({ enableAnimations: enable });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSavedSettings(), enableAnimations: enable }));
  },
  setPage: (p) => set({ page: p }),

  performSearch: async (q, type, pageNum = 1) => {
    if (!q) return;
    
    set({ 
      query: q, 
      type: type, 
      page: pageNum,
      isInitialLoading: true, 
      results: [], 
      error: null 
    });

    try {
      const pager = createPager({ q, type, lang: get().language }, 20);
      set({ pager });
      
      let result = null;
      for (let i = 0; i < pageNum; i++) {
        result = await pager.next();
      }

      const data = result?.data as any;
      const items = Array.isArray(data) ? data : (data?.results || []);

      if (result && result.ok && items.length > 0) {
        set({ 
          results: items, 
          isInitialLoading: false 
        });
      } else {
        set({ 
          results: [],
          error: result?.error || 'Search failed', 
          isInitialLoading: false 
        });
      }
    } catch (e) {
      set({ results: [], error: 'An unexpected error occurred', isInitialLoading: false });
    }
  },

  resetSearch: () => {
    set({ 
      results: [], 
      pager: null, 
      error: null, 
      isInitialLoading: false, 
      isLoading: false 
    });
  }
}));
