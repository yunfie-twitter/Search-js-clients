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

export type SafeSearchLevel = 'off' | 'moderate' | 'strict';
export type DefaultSearchType = 'web' | 'image' | 'video' | 'news';

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

  resultsPerPage: 10 | 20 | 50;
  defaultSearchType: DefaultSearchType;
  safeSearch: SafeSearchLevel;
  cacheTtl: 0 | 5 | 30 | 60;
  searchRegion: string;
  searchLang: string;

  expImageSearch: boolean;
  expLenis: boolean;
  expUnlocked: boolean;
  expAiSummary: boolean;
  expKnowledgePanel: boolean;
  expGeminiFactCheck: boolean;
  expMergedAiPanel: boolean;
  geminiApiKey: string;
  geminiFactCheckApiKey: string;

  setQuery: (q: string) => void;
  setType: (t: SearchType) => void;
  setSelectedItem: (item: ResultDetail | null) => void;
  setLanguage: (lang: 'ja' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSaveHistory: (save: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setPage: (p: number) => void;
  setResultsPerPage: (n: 10 | 20 | 50) => void;
  setDefaultSearchType: (t: DefaultSearchType) => void;
  setSafeSearch: (level: SafeSearchLevel) => void;
  setCacheTtl: (ttl: 0 | 5 | 30 | 60) => void;
  setSearchRegion: (region: string) => void;
  setSearchLang: (lang: string) => void;
  setExpImageSearch: (v: boolean) => void;
  setExpLenis: (v: boolean) => void;
  setExpUnlocked: (v: boolean) => void;
  setExpAiSummary: (v: boolean) => void;
  setExpKnowledgePanel: (v: boolean) => void;
  setExpGeminiFactCheck: (v: boolean) => void;
  setExpMergedAiPanel: (v: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  setGeminiFactCheckApiKey: (key: string) => void;

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

let settingsCache: Record<string, any> = getSavedSettings();

const saveSetting = (key: string, value: any) => {
  settingsCache[key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsCache));
};

const saved = settingsCache;

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

  resultsPerPage: saved.resultsPerPage || 20,
  defaultSearchType: saved.defaultSearchType || 'web',
  safeSearch: saved.safeSearch || 'moderate',
  cacheTtl: saved.cacheTtl !== undefined ? saved.cacheTtl : 5,
  searchRegion: saved.searchRegion || 'JP',
  searchLang: saved.searchLang || 'ja',

  expImageSearch:        saved.expImageSearch        !== undefined ? saved.expImageSearch        : false,
  expLenis:              saved.expLenis              !== undefined ? saved.expLenis              : false,
  expUnlocked:           saved.expUnlocked           !== undefined ? saved.expUnlocked           : false,
  expAiSummary:          saved.expAiSummary          !== undefined ? saved.expAiSummary          : false,
  expKnowledgePanel:     saved.expKnowledgePanel     !== undefined ? saved.expKnowledgePanel     : false,
  expGeminiFactCheck:    saved.expGeminiFactCheck    !== undefined ? saved.expGeminiFactCheck    : false,
  expMergedAiPanel:      saved.expMergedAiPanel      !== undefined ? saved.expMergedAiPanel      : false,
  geminiApiKey:          saved.geminiApiKey          || '',
  geminiFactCheckApiKey: saved.geminiFactCheckApiKey || '',

  setQuery: (q) => set({ query: q }),
  setType: (t) => set({ type: t }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLanguage: (lang) => { set({ language: lang }); saveSetting('language', lang); },
  setThemeMode: (mode) => { set({ themeMode: mode }); saveSetting('themeMode', mode); },
  setSaveHistory: (save) => { set({ saveHistory: save }); saveSetting('saveHistory', save); },
  setEnableAnimations: (enable) => { set({ enableAnimations: enable }); saveSetting('enableAnimations', enable); },
  setPage: (p) => set({ page: p }),
  setResultsPerPage: (n) => { set({ resultsPerPage: n }); saveSetting('resultsPerPage', n); },
  setDefaultSearchType: (t) => { set({ defaultSearchType: t }); saveSetting('defaultSearchType', t); },
  setSafeSearch: (level) => { set({ safeSearch: level }); saveSetting('safeSearch', level); },
  setCacheTtl: (ttl) => { set({ cacheTtl: ttl }); saveSetting('cacheTtl', ttl); },
  setSearchRegion: (region) => { set({ searchRegion: region }); saveSetting('searchRegion', region); },
  setSearchLang: (lang) => { set({ searchLang: lang }); saveSetting('searchLang', lang); },
  setExpImageSearch:      (v) => { set({ expImageSearch: v });      saveSetting('expImageSearch', v); },
  setExpLenis:            (v) => { set({ expLenis: v });            saveSetting('expLenis', v); },
  setExpUnlocked:         (v) => { set({ expUnlocked: v });         saveSetting('expUnlocked', v); },
  setExpAiSummary:        (v) => { set({ expAiSummary: v });        saveSetting('expAiSummary', v); },
  setExpKnowledgePanel:   (v) => { set({ expKnowledgePanel: v });   saveSetting('expKnowledgePanel', v); },
  setExpGeminiFactCheck:  (v) => { set({ expGeminiFactCheck: v });  saveSetting('expGeminiFactCheck', v); },
  setExpMergedAiPanel:    (v) => { set({ expMergedAiPanel: v });    saveSetting('expMergedAiPanel', v); },
  setGeminiApiKey:        (key) => { set({ geminiApiKey: key });    saveSetting('geminiApiKey', key); },
  setGeminiFactCheckApiKey: (key) => { set({ geminiFactCheckApiKey: key }); saveSetting('geminiFactCheckApiKey', key); },

  performSearch: async (q, type, pageNum = 1) => {
    if (!q) return;
    const { resultsPerPage, searchLang } = get();

    set({
      query: q,
      type: type,
      page: pageNum,
      isInitialLoading: true,
      results: [],
      error: null
    });

    try {
      const pager = createPager(
        { q, type, lang: searchLang },
        resultsPerPage
      );
      set({ pager });

      let result = null;
      for (let i = 0; i < pageNum; i++) {
        result = await pager.next();
      }

      const data  = result?.data as any;
      const items = Array.isArray(data) ? data : (data?.results || []);

      if (result && result.ok && items.length > 0) {
        set({ results: items, isInitialLoading: false });
      } else {
        set({ results: [], error: result?.error || 'Search failed', isInitialLoading: false });
      }
    } catch (e) {
      set({ results: [], error: 'An unexpected error occurred', isInitialLoading: false });
    }
  },

  resetSearch: () => {
    set({ results: [], pager: null, error: null, isInitialLoading: false, isLoading: false });
  }
}));
