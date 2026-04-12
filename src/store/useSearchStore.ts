import { create } from 'zustand';
import {
  SearchType,
  ResultMeta,
  ResultDetail,
  Pager,
  createPager,
  getHistory,
  clearHistory
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
  pageTransitionType: 'standard' | 'fade' | 'none';
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
  expHomeCards: boolean;
  expCustomAccentColor: boolean;
  accentColor: string;
  expCustomFontSize: boolean;
  fontSizeBase: number;
  expAiHistorySummary: boolean;
  expLongPressMenu: boolean;
  expWeatherCard: boolean;
  expSettingsExportImport: boolean;
  expScrollHeader: boolean;
  expLongPressRelated: boolean;
  expScreenshotShare: boolean;
  expHistoryExport: boolean;
  expHistoryHeatmap: boolean;
  expFocusMode: boolean;
  expContextMemory: boolean;
  expQueryExpansion: boolean;
  expSwipeActions: boolean;
  expViewDensity: boolean;
  viewDensity: 'comfortable' | 'compact' | 'list';
  expSearchLater: boolean;
  expWikiQuickJump: boolean;
  expMiniBrowser: boolean;
  expPrivateMode: boolean;
  expEncryptedStorage: boolean;
  expColorBlindMode: boolean;
  
  expSpringCard: boolean;
  expBottomSheet: boolean;
  expPeekAndPop: boolean;
  expLiquidTabBar: boolean;
  expBreadcrumbsNav: boolean;
  expSwipeBack: boolean;
  expMorphingSearch: boolean;
  expFocusBlur: boolean;
  expTypingIndicator: boolean;
  expPersonalizedSkeleton: boolean;
  expHoverElevation: boolean;
  expReadProgress: boolean;
  expCopyToast: boolean;
  expErrorShake: boolean;
  expEnhancedRipple: boolean;
  expDynamicGradient: boolean;
  expFrostGlass: boolean;
  expJustifyText: boolean;
  expEnhancedAnimations: boolean;
  expLowEndMode: boolean;
  expProgressiveRender: boolean;
  expUseInvidious: boolean;
  invidiousInstance: string;
  customInvidiousUrl: string;
  expNewsMarkdown: boolean;
  markdownApiEndpoint: string;
  markdownApiMethod: 'POST' | 'GET';

  searchServerMode: 'default' | 'custom';
  customSearchServer: string;

  expMicroSparks: boolean;
  expCommandPalette: boolean;
  expVoiceWaveform: boolean;
  expHideNavOnScroll: boolean;
  expBionicReading: boolean;
  expReadingTimeBadge: boolean;
  expLiquidPtr: boolean;
  expGyroParallax: boolean;
  expSwipeMultiSelect: boolean;
  expSonicUi: boolean;
  expThumbFab: boolean;
  expCursorHalo: boolean;
  expChameleonTheme: boolean;
  expMarkerHighlight: boolean;
  expFlipImageZoom: boolean;
  expKineticTypography: boolean;

  exp3dTouch: boolean;
  expNativeScrollBounce: boolean;
  expNativePageTransition: boolean;
  expNativeHapticFeedback: boolean;
  expNativeContextMenu: boolean;
  expNativePullToRefresh: boolean;

  lastResultCount: number;

  hasCompletedSetup: boolean;
  notifications: { id: string; title: string; message: string; date: number; read: boolean; type: 'update' | 'rss' }[];
  setHasCompletedSetup: (v: boolean) => void;
  addNotification: (n: { title: string; message: string; type: 'update' | 'rss' }) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  activeHomeCards: string[];
  widgetSizes: Record<string, 'small' | 'medium' | 'large'>;
  thirdPartyWidgets: { id: string, name: string, code: string }[];
  rssFeeds: string[];
  worldClocks: string[];
  searchLaterList: { id: string, q: string, time: number }[];
  geminiApiKey: string;
  geminiFactCheckApiKey: string;

  setQuery: (q: string) => void;
  setType: (t: SearchType) => void;
  setSelectedItem: (item: ResultDetail | null) => void;
  setLanguage: (lang: 'ja' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSaveHistory: (save: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setPageTransitionType: (type: 'standard' | 'fade' | 'none') => void;
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
  setExpHomeCards: (v: boolean) => void;
  setExpCustomAccentColor: (v: boolean) => void;
  setAccentColor: (color: string) => void;
  setExpCustomFontSize: (v: boolean) => void;
  setFontSizeBase: (size: number) => void;
  setExpAiHistorySummary: (v: boolean) => void;
  setExpLongPressMenu: (v: boolean) => void;
  setExpWeatherCard: (v: boolean) => void;
  setExpSettingsExportImport: (v: boolean) => void;
  setExpScrollHeader: (v: boolean) => void;
  setExpLongPressRelated: (v: boolean) => void;
  setExpScreenshotShare: (v: boolean) => void;
  setExpHistoryExport: (v: boolean) => void;
  setExpHistoryHeatmap: (v: boolean) => void;
  setExpFocusMode: (v: boolean) => void;
  setExpContextMemory: (v: boolean) => void;
  setExpQueryExpansion: (v: boolean) => void;
  setExpSwipeActions: (v: boolean) => void;
  setExpViewDensity: (v: boolean) => void;
  setViewDensity: (v: 'comfortable' | 'compact' | 'list') => void;
  setExpSearchLater: (v: boolean) => void;
  setExpWikiQuickJump: (v: boolean) => void;
  setExpMiniBrowser: (v: boolean) => void;
  setExpPrivateMode: (v: boolean) => void;
  setExpEncryptedStorage: (v: boolean) => void;
  setExpColorBlindMode: (v: boolean) => void;

  setExpSpringCard: (v: boolean) => void;
  setExpBottomSheet: (v: boolean) => void;
  setExpPeekAndPop: (v: boolean) => void;
  setExpLiquidTabBar: (v: boolean) => void;
  setExpBreadcrumbsNav: (v: boolean) => void;
  setExpSwipeBack: (v: boolean) => void;
  setExpMorphingSearch: (v: boolean) => void;
  setExpFocusBlur: (v: boolean) => void;
  setExpTypingIndicator: (v: boolean) => void;
  setExpPersonalizedSkeleton: (v: boolean) => void;
  setExpHoverElevation: (v: boolean) => void;
  setExpReadProgress: (v: boolean) => void;
  setExpCopyToast: (v: boolean) => void;
  setExpErrorShake: (v: boolean) => void;
  setExpEnhancedRipple: (v: boolean) => void;
  setExpDynamicGradient: (v: boolean) => void;
  setExpFrostGlass: (v: boolean) => void;
  setExpJustifyText: (v: boolean) => void;
  setExpEnhancedAnimations: (v: boolean) => void;
  setExpLowEndMode: (v: boolean) => void;
  setExpProgressiveRender: (v: boolean) => void;
  setExpFlipImageZoom: (v: boolean) => void;
  setExpKineticTypography: (v: boolean) => void;

  setExp3dTouch: (v: boolean) => void;
  setExpNativeScrollBounce: (v: boolean) => void;
  setExpNativePageTransition: (v: boolean) => void;
  setExpNativeHapticFeedback: (v: boolean) => void;
  setExpNativeContextMenu: (v: boolean) => void;
  setExpNativePullToRefresh: (v: boolean) => void;

  setLastResultCount: (n: number) => void;

  setActiveHomeCards: (cards: string[]) => void;
  setWidgetSizes: (sizes: Record<string, 'small' | 'medium' | 'large'>) => void;
  setThirdPartyWidgets: (widgets: { id: string, name: string, code: string }[]) => void;
  setRssFeeds: (feeds: string[]) => void;
  setWorldClocks: (clocks: string[]) => void;
  addSearchLater: (q: string) => void;
  removeSearchLater: (id: string) => void;
  setGeminiApiKey: (key: string) => void;
  setGeminiFactCheckApiKey: (key: string) => void;

  setExpUseInvidious: (v: boolean) => void;
  setInvidiousInstance: (v: string) => void;
  setCustomInvidiousUrl: (v: string) => void;
  setExpNewsMarkdown: (v: boolean) => void;
  setMarkdownApiEndpoint: (v: string) => void;
  setMarkdownApiMethod: (v: 'POST' | 'GET') => void;

  setSearchServerMode: (mode: 'default' | 'custom') => void;
  setCustomSearchServer: (server: string) => void;

  activeVideo: ResultMeta | null;
  isVideoMinimized: boolean;
  videoPosition: { x: number; y: number };
  setActiveVideo: (v: ResultMeta | null) => void;
  setVideoMinimized: (v: boolean) => void;
  setVideoPosition: (pos: { x: number; y: number }) => void;

  performSearch: (q: string, type: SearchType, page?: number) => Promise<void>;
  resetSearch: () => void;

  resetAllData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  triggerFullSync: () => void;

  syncGroupId: string;
  syncServerMode: 'default' | 'custom';
  syncServerUrl: string;
  enableSync: boolean;
  deviceId: string;
  deviceName: string;
  connectedDevices: { id: string, name: string, lastSeen: number }[];
  setSyncGroupId: (id: string) => void;
  setSyncServerMode: (mode: 'default' | 'custom') => void;
  setSyncServerUrl: (url: string) => void;
  setEnableSync: (v: boolean) => void;
  setDeviceName: (name: string) => void;
  setConnectedDevices: (devices: { id: string, name: string, lastSeen: number }[]) => void;
}

const searchCache = new Map<string, { results: ResultMeta[], pager: Pager }>();
const STORAGE_KEY = 'wholphin_settings';

const getInitialState = () => ({
  language: 'ja',
  themeMode: 'system',
  saveHistory: true,
  enableAnimations: true,
  pageTransitionType: 'standard',
  resultsPerPage: 20,
  defaultSearchType: 'web',
  safeSearch: 'moderate',
  cacheTtl: 5,
  searchRegion: 'JP',
  searchLang: 'ja',
  expImageSearch: false,
  expLenis: false,
  expUnlocked: false,
  expAiSummary: false,
  expKnowledgePanel: false,
  expGeminiFactCheck: false,
  expMergedAiPanel: false,
  expHomeCards: false,
  expCustomAccentColor: false,
  accentColor: '',
  expCustomFontSize: false,
  fontSizeBase: 17,
  expAiHistorySummary: false,
  expLongPressMenu: false,
  expWeatherCard: false,
  expSettingsExportImport: false,
  expScrollHeader: false,
  expLongPressRelated: false,
  expScreenshotShare: false,
  expHistoryExport: false,
  expHistoryHeatmap: false,
  expFocusMode: false,
  expContextMemory: false,
  expQueryExpansion: false,
  expSwipeActions: false,
  expViewDensity: false,
  viewDensity: 'comfortable',
  expSearchLater: false,
  expWikiQuickJump: false,
  expMiniBrowser: false,
  expPrivateMode: false,
  expEncryptedStorage: false,
  expColorBlindMode: false,
  expSpringCard: false,
  expBottomSheet: false,
  expPeekAndPop: false,
  expLiquidTabBar: false,
  expBreadcrumbsNav: false,
  expSwipeBack: false,
  expMorphingSearch: false,
  expFocusBlur: false,
  expTypingIndicator: false,
  expPersonalizedSkeleton: false,
  expHoverElevation: false,
  expReadProgress: false,
  expCopyToast: false,
  expErrorShake: false,
  expEnhancedRipple: false,
  expDynamicGradient: false,
  expFrostGlass: false,
  expJustifyText: false,
  expEnhancedAnimations: false,
  expLowEndMode: false,
  expProgressiveRender: true,
  expUseInvidious: false,
  invidiousInstance: 'https://inv.nadeko.net/',
  customInvidiousUrl: '',
  expNewsMarkdown: false,
  markdownApiEndpoint: 'http://localhost:8000/convert',
  markdownApiMethod: 'POST',
  searchServerMode: 'default',
  customSearchServer: 'https://api.wholphin.net',
  expMicroSparks: false,
  expCommandPalette: false,
  expVoiceWaveform: false,
  expHideNavOnScroll: false,
  expBionicReading: false,
  expReadingTimeBadge: false,
  expLiquidPtr: false,
  expGyroParallax: false,
  expSwipeMultiSelect: false,
  expSonicUi: false,
  expThumbFab: false,
  expCursorHalo: false,
  expChameleonTheme: false,
  expMarkerHighlight: false,
  expFlipImageZoom: false,
  expKineticTypography: false,
  exp3dTouch: false,
  expNativeScrollBounce: false,
  expNativePageTransition: false,
  expNativeHapticFeedback: false,
  expNativeContextMenu: false,
  expNativePullToRefresh: false,
  lastResultCount: 10,
  hasCompletedSetup: false,
  notifications: [
    { id: 'welcome', title: 'Wholphinへようこそ', message: '最新の検索体験をお楽しみください。', date: Date.now(), read: false, type: 'update' }
  ],
  activeHomeCards: ['weather', 'trending', 'features'],
  widgetSizes: {},
  thirdPartyWidgets: [],
  rssFeeds: ['https://news.yahoo.co.jp/rss/topics/it.xml'],
  worldClocks: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
  searchLaterList: [],
  geminiApiKey: '',
  geminiFactCheckApiKey: '',
  syncGroupId: '',
  syncServerMode: 'default',
  syncServerUrl: 'wss://turn.wholphin.net/ws',
  enableSync: false,
  deviceId: Math.random().toString(36).substring(2, 15),
  deviceName: '',
  connectedDevices: [],
});

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

let settingsCache: Record<string, any> = getSavedSettings();
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const saveSetting = (key: string, value: any) => {
  if (settingsCache.expPrivateMode) {
     if (key !== 'expPrivateMode') return;
  }
  settingsCache[key] = value;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsCache));
    } catch (e) { console.error('Failed to save settings', e); }
  }, 1000); 
};

const saved = settingsCache;
const initialState = getInitialState();

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  type: 'web',
  results: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,
  pager: null,
  selectedItem: null,
  language: saved.language || initialState.language,
  themeMode: saved.themeMode || initialState.themeMode,
  saveHistory: saved.saveHistory !== undefined ? saved.saveHistory : initialState.saveHistory,
  enableAnimations: saved.enableAnimations !== undefined ? saved.enableAnimations : initialState.enableAnimations,
  pageTransitionType: saved.pageTransitionType || initialState.pageTransitionType,
  page: 1,
  resultsPerPage: saved.resultsPerPage || initialState.resultsPerPage,
  defaultSearchType: saved.defaultSearchType || initialState.defaultSearchType,
  safeSearch: saved.safeSearch || initialState.safeSearch,
  cacheTtl: saved.cacheTtl !== undefined ? saved.cacheTtl : initialState.cacheTtl,
  searchRegion: saved.searchRegion || initialState.searchRegion,
  searchLang: saved.searchLang || initialState.searchLang,
  expImageSearch: saved.expImageSearch !== undefined ? saved.expImageSearch : initialState.expImageSearch,
  expLenis: saved.expLenis !== undefined ? saved.expLenis : initialState.expLenis,
  expUnlocked: saved.expUnlocked !== undefined ? saved.expUnlocked : initialState.expUnlocked,
  expAiSummary: saved.expAiSummary !== undefined ? saved.expAiSummary : initialState.expAiSummary,
  expKnowledgePanel: saved.expKnowledgePanel !== undefined ? saved.expKnowledgePanel : initialState.expKnowledgePanel,
  expGeminiFactCheck: saved.expGeminiFactCheck !== undefined ? saved.expGeminiFactCheck : initialState.expGeminiFactCheck,
  expMergedAiPanel: saved.expMergedAiPanel !== undefined ? saved.expMergedAiPanel : initialState.expMergedAiPanel,
  expHomeCards: saved.expHomeCards !== undefined ? saved.expHomeCards : initialState.expHomeCards,
  expCustomAccentColor: saved.expCustomAccentColor !== undefined ? saved.expCustomAccentColor : initialState.expCustomAccentColor,
  accentColor: saved.accentColor || initialState.accentColor,
  expCustomFontSize: saved.expCustomFontSize !== undefined ? saved.expCustomFontSize : initialState.expCustomFontSize,
  fontSizeBase: saved.fontSizeBase !== undefined ? saved.fontSizeBase : initialState.fontSizeBase,
  expAiHistorySummary: saved.expAiHistorySummary !== undefined ? saved.expAiHistorySummary : initialState.expAiHistorySummary,
  expLongPressMenu: saved.expLongPressMenu !== undefined ? saved.expLongPressMenu : initialState.expLongPressMenu,
  expWeatherCard: saved.expWeatherCard !== undefined ? saved.expWeatherCard : initialState.expWeatherCard,
  expSettingsExportImport: saved.expSettingsExportImport !== undefined ? saved.expSettingsExportImport : initialState.expSettingsExportImport,
  expScrollHeader: saved.expScrollHeader !== undefined ? saved.expScrollHeader : initialState.expScrollHeader,
  expLongPressRelated: saved.expLongPressRelated !== undefined ? saved.expLongPressRelated : initialState.expLongPressRelated,
  expScreenshotShare: saved.expScreenshotShare !== undefined ? saved.expScreenshotShare : initialState.expScreenshotShare,
  expHistoryExport: saved.expHistoryExport !== undefined ? saved.expHistoryExport : initialState.expHistoryExport,
  expHistoryHeatmap: saved.expHistoryHeatmap !== undefined ? saved.expHistoryHeatmap : initialState.expHistoryHeatmap,
  expFocusMode: saved.expFocusMode !== undefined ? saved.expFocusMode : initialState.expFocusMode,
  expContextMemory: saved.expContextMemory !== undefined ? saved.expContextMemory : initialState.expContextMemory,
  expQueryExpansion: saved.expQueryExpansion !== undefined ? saved.expQueryExpansion : initialState.expQueryExpansion,
  expSwipeActions: saved.expSwipeActions !== undefined ? saved.expSwipeActions : initialState.expSwipeActions,
  expViewDensity: saved.expViewDensity !== undefined ? saved.expViewDensity : initialState.expViewDensity,
  viewDensity: saved.viewDensity || initialState.viewDensity,
  expSearchLater: saved.expSearchLater !== undefined ? saved.expSearchLater : initialState.expSearchLater,
  expWikiQuickJump: saved.expWikiQuickJump !== undefined ? saved.expWikiQuickJump : initialState.expWikiQuickJump,
  expMiniBrowser: saved.expMiniBrowser !== undefined ? saved.expMiniBrowser : initialState.expMiniBrowser,
  expPrivateMode: saved.expPrivateMode !== undefined ? saved.expPrivateMode : initialState.expPrivateMode,
  expEncryptedStorage: saved.expEncryptedStorage !== undefined ? saved.expEncryptedStorage : initialState.expEncryptedStorage,
  expColorBlindMode: saved.expColorBlindMode !== undefined ? saved.expColorBlindMode : initialState.expColorBlindMode,
  expSpringCard: saved.expSpringCard !== undefined ? saved.expSpringCard : initialState.expSpringCard,
  expBottomSheet: saved.expBottomSheet !== undefined ? saved.expBottomSheet : initialState.expBottomSheet,
  expPeekAndPop: saved.expPeekAndPop !== undefined ? saved.expPeekAndPop : initialState.expPeekAndPop,
  expLiquidTabBar: saved.expLiquidTabBar !== undefined ? saved.expLiquidTabBar : initialState.expLiquidTabBar,
  expBreadcrumbsNav: saved.expBreadcrumbsNav !== undefined ? saved.expBreadcrumbsNav : initialState.expBreadcrumbsNav,
  expSwipeBack: saved.expSwipeBack !== undefined ? saved.expSwipeBack : initialState.expSwipeBack,
  expMorphingSearch: saved.expMorphingSearch !== undefined ? saved.expMorphingSearch : initialState.expMorphingSearch,
  expFocusBlur: saved.expFocusBlur !== undefined ? saved.expFocusBlur : initialState.expFocusBlur,
  expTypingIndicator: saved.expTypingIndicator !== undefined ? saved.expTypingIndicator : initialState.expTypingIndicator,
  expPersonalizedSkeleton: saved.expPersonalizedSkeleton !== undefined ? saved.expPersonalizedSkeleton : initialState.expPersonalizedSkeleton,
  expHoverElevation: saved.expHoverElevation !== undefined ? saved.expHoverElevation : initialState.expHoverElevation,
  expReadProgress: saved.expReadProgress !== undefined ? saved.expReadProgress : initialState.expReadProgress,
  expCopyToast: saved.expCopyToast !== undefined ? saved.expCopyToast : initialState.expCopyToast,
  expErrorShake: saved.expErrorShake !== undefined ? saved.expErrorShake : initialState.expErrorShake,
  expEnhancedRipple: saved.expEnhancedRipple !== undefined ? saved.expEnhancedRipple : initialState.expEnhancedRipple,
  expDynamicGradient: saved.expDynamicGradient !== undefined ? saved.expDynamicGradient : initialState.expDynamicGradient,
  expFrostGlass: saved.expFrostGlass !== undefined ? saved.expFrostGlass : initialState.expFrostGlass,
  expJustifyText: saved.expJustifyText !== undefined ? saved.expJustifyText : initialState.expJustifyText,
  expEnhancedAnimations: saved.expEnhancedAnimations !== undefined ? saved.expEnhancedAnimations : initialState.expEnhancedAnimations,
  expLowEndMode: saved.expLowEndMode !== undefined ? saved.expLowEndMode : initialState.expLowEndMode,
  expProgressiveRender: saved.expProgressiveRender !== undefined ? saved.expProgressiveRender : initialState.expProgressiveRender,
  expUseInvidious: saved.expUseInvidious !== undefined ? saved.expUseInvidious : initialState.expUseInvidious,
  invidiousInstance: saved.invidiousInstance || initialState.invidiousInstance,
  customInvidiousUrl: saved.customInvidiousUrl || initialState.customInvidiousUrl,
  expNewsMarkdown: saved.expNewsMarkdown !== undefined ? saved.expNewsMarkdown : initialState.expNewsMarkdown,
  markdownApiEndpoint: saved.markdownApiEndpoint || initialState.markdownApiEndpoint,
  markdownApiMethod: saved.markdownApiMethod || initialState.markdownApiMethod,
  searchServerMode: saved.searchServerMode || initialState.searchServerMode,
  customSearchServer: saved.customSearchServer || initialState.customSearchServer,
  expMicroSparks: saved.expMicroSparks !== undefined ? saved.expMicroSparks : initialState.expMicroSparks,
  expCommandPalette: saved.expCommandPalette !== undefined ? saved.expCommandPalette : initialState.expCommandPalette,
  expVoiceWaveform: saved.expVoiceWaveform !== undefined ? saved.expVoiceWaveform : initialState.expVoiceWaveform,
  expHideNavOnScroll: saved.expHideNavOnScroll !== undefined ? saved.expHideNavOnScroll : initialState.expHideNavOnScroll,
  expBionicReading: saved.expBionicReading !== undefined ? saved.expBionicReading : initialState.expBionicReading,
  expReadingTimeBadge: saved.expReadingTimeBadge !== undefined ? saved.expReadingTimeBadge : initialState.expReadingTimeBadge,
  expLiquidPtr: saved.expLiquidPtr !== undefined ? saved.expLiquidPtr : initialState.expLiquidPtr,
  expGyroParallax: saved.expGyroParallax !== undefined ? saved.expGyroParallax : initialState.expGyroParallax,
  expSwipeMultiSelect: saved.expSwipeMultiSelect !== undefined ? saved.expSwipeMultiSelect : initialState.expSwipeMultiSelect,
  expSonicUi: saved.expSonicUi !== undefined ? saved.expSonicUi : initialState.expSonicUi,
  expThumbFab: saved.expThumbFab !== undefined ? saved.expThumbFab : initialState.expThumbFab,
  expCursorHalo: saved.expCursorHalo !== undefined ? saved.expCursorHalo : initialState.expCursorHalo,
  expChameleonTheme: saved.expChameleonTheme !== undefined ? saved.expChameleonTheme : initialState.expChameleonTheme,
  expMarkerHighlight: saved.expMarkerHighlight !== undefined ? saved.expMarkerHighlight : initialState.expMarkerHighlight,
  expFlipImageZoom: saved.expFlipImageZoom !== undefined ? saved.expFlipImageZoom : initialState.expFlipImageZoom,
  expKineticTypography: saved.expKineticTypography !== undefined ? saved.expKineticTypography : initialState.expKineticTypography,
  exp3dTouch: saved.exp3dTouch !== undefined ? saved.exp3dTouch : initialState.exp3dTouch,
  expNativeScrollBounce: saved.expNativeScrollBounce !== undefined ? saved.expNativeScrollBounce : initialState.expNativeScrollBounce,
  expNativePageTransition: saved.expNativePageTransition !== undefined ? saved.expNativePageTransition : initialState.expNativePageTransition,
  expNativeHapticFeedback: saved.expNativeHapticFeedback !== undefined ? saved.expNativeHapticFeedback : initialState.expNativeHapticFeedback,
  expNativeContextMenu: saved.expNativeContextMenu !== undefined ? saved.expNativeContextMenu : initialState.expNativeContextMenu,
  expNativePullToRefresh: saved.expNativePullToRefresh !== undefined ? saved.expNativePullToRefresh : initialState.expNativePullToRefresh,
  lastResultCount: saved.lastResultCount !== undefined ? saved.lastResultCount : initialState.lastResultCount,
  hasCompletedSetup: saved.hasCompletedSetup !== undefined ? saved.hasCompletedSetup : initialState.hasCompletedSetup,
  notifications: saved.notifications || initialState.notifications,
  activeHomeCards: saved.activeHomeCards || initialState.activeHomeCards,
  widgetSizes: saved.widgetSizes || initialState.widgetSizes,
  thirdPartyWidgets: saved.thirdPartyWidgets || initialState.thirdPartyWidgets,
  rssFeeds: saved.rssFeeds || initialState.rssFeeds,
  worldClocks: saved.worldClocks || initialState.worldClocks,
  searchLaterList: saved.searchLaterList || initialState.searchLaterList,
  geminiApiKey: saved.geminiApiKey || initialState.geminiApiKey,
  geminiFactCheckApiKey: saved.geminiFactCheckApiKey || initialState.geminiFactCheckApiKey,
  syncGroupId: saved.syncGroupId || initialState.syncGroupId,
  syncServerMode: saved.syncServerMode || initialState.syncServerMode,
  syncServerUrl: saved.syncServerUrl || initialState.syncServerUrl,
  enableSync: saved.enableSync !== undefined ? saved.enableSync : initialState.enableSync,
  deviceId: saved.deviceId || initialState.deviceId,
  deviceName: saved.deviceName || initialState.deviceName,
  connectedDevices: [],

  activeVideo: null,
  isVideoMinimized: false,
  videoPosition: { x: 0, y: 0 },
  setActiveVideo: (v) => set({ activeVideo: v }),
  setVideoMinimized: (v) => set({ isVideoMinimized: v }),
  setVideoPosition: (pos) => set({ videoPosition: pos }),

  setQuery: (q) => set({ query: q }),
  setType: (t) => { set({ type: t, results: [], isInitialLoading: true, error: null }); saveSetting('type', t); },
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLanguage: (lang) => { set({ language: lang }); saveSetting('language', lang); },
  setThemeMode: (mode) => { set({ themeMode: mode }); saveSetting('themeMode', mode); },
  setSaveHistory: (save) => { set({ saveHistory: save }); saveSetting('saveHistory', save); },
  setEnableAnimations: (enable) => { set({ enableAnimations: enable }); saveSetting('enableAnimations', enable); },
  setPageTransitionType: (type) => { set({ pageTransitionType: type }); saveSetting('pageTransitionType', type); },
  setPage: (p) => set({ page: p }),
  setResultsPerPage: (n) => { set({ resultsPerPage: n }); saveSetting('resultsPerPage', n); },
  setDefaultSearchType: (t) => { set({ defaultSearchType: t }); saveSetting('defaultSearchType', t); },
  setSafeSearch: (level) => { set({ safeSearch: level }); saveSetting('safeSearch', level); },
  setCacheTtl: (ttl) => { set({ cacheTtl: ttl }); saveSetting('cacheTtl', ttl); },
  setSearchRegion: (region) => { set({ searchRegion: region }); saveSetting('searchRegion', region); },
  setSearchLang: (lang) => { set({ searchLang: lang }); saveSetting('searchLang', lang); },
  setExpImageSearch: (v) => { set({ expImageSearch: v }); saveSetting('expImageSearch', v); },
  setExpLenis: (v) => { set({ expLenis: v }); saveSetting('expLenis', v); },
  setExpUnlocked: (v) => { set({ expUnlocked: v }); saveSetting('expUnlocked', v); },
  setExpAiSummary: (v) => { set({ expAiSummary: v }); saveSetting('expAiSummary', v); },
  setExpKnowledgePanel: (v) => { set({ expKnowledgePanel: v }); saveSetting('expKnowledgePanel', v); },
  setExpGeminiFactCheck: (v) => { set({ expGeminiFactCheck: v }); saveSetting('expGeminiFactCheck', v); },
  setExpMergedAiPanel: (v) => { set({ expMergedAiPanel: v }); saveSetting('expMergedAiPanel', v); },
  setExpHomeCards: (v) => { set({ expHomeCards: v }); saveSetting('expHomeCards', v); },
  setExpCustomAccentColor: (v) => { set({ expCustomAccentColor: v }); saveSetting('expCustomAccentColor', v); },
  setAccentColor: (v) => { set({ accentColor: v }); saveSetting('accentColor', v); },
  setExpCustomFontSize: (v) => { set({ expCustomFontSize: v }); saveSetting('expCustomFontSize', v); },
  setFontSizeBase: (v) => { set({ fontSizeBase: v }); saveSetting('fontSizeBase', v); },
  setExpAiHistorySummary: (v) => { set({ expAiHistorySummary: v }); saveSetting('expAiHistorySummary', v); },
  setExpLongPressMenu: (v) => { set({ expLongPressMenu: v }); saveSetting('expLongPressMenu', v); },
  setExpWeatherCard: (v) => { set({ expWeatherCard: v }); saveSetting('expWeatherCard', v); },
  setExpSettingsExportImport: (v) => { set({ expSettingsExportImport: v }); saveSetting('expSettingsExportImport', v); },
  setExpScrollHeader: (v) => { set({ expScrollHeader: v }); saveSetting('expScrollHeader', v); },
  setExpLongPressRelated: (v) => { set({ expLongPressRelated: v }); saveSetting('expLongPressRelated', v); },
  setExpScreenshotShare: (v) => { set({ expScreenshotShare: v }); saveSetting('expScreenshotShare', v); },
  setExpHistoryExport: (v) => { set({ expHistoryExport: v }); saveSetting('expHistoryExport', v); },
  setExpHistoryHeatmap: (v) => { set({ expHistoryHeatmap: v }); saveSetting('expHistoryHeatmap', v); },
  setExpFocusMode: (v) => { set({ expFocusMode: v }); saveSetting('expFocusMode', v); },
  setExpContextMemory: (v) => { set({ expContextMemory: v }); saveSetting('expContextMemory', v); },
  setExpQueryExpansion: (v) => { set({ expQueryExpansion: v }); saveSetting('expQueryExpansion', v); },
  setExpSwipeActions: (v) => { set({ expSwipeActions: v }); saveSetting('expSwipeActions', v); },
  setExpViewDensity: (v) => { set({ expViewDensity: v }); saveSetting('expViewDensity', v); },
  setViewDensity: (v) => { set({ viewDensity: v }); saveSetting('viewDensity', v); },
  setExpSearchLater: (v) => { set({ expSearchLater: v }); saveSetting('expSearchLater', v); },
  setExpWikiQuickJump: (v) => { set({ expWikiQuickJump: v }); saveSetting('expWikiQuickJump', v); },
  setExpMiniBrowser: (v) => { set({ expMiniBrowser: v }); saveSetting('expMiniBrowser', v); },
  setExpPrivateMode: (v) => { set({ expPrivateMode: v }); saveSetting('expPrivateMode', v); },
  setExpEncryptedStorage: (v) => { set({ expEncryptedStorage: v }); saveSetting('expEncryptedStorage', v); },
  setExpColorBlindMode: (v) => { set({ expColorBlindMode: v }); saveSetting('expColorBlindMode', v); },
  setExpSpringCard: (v) => { set({ expSpringCard: v }); saveSetting('expSpringCard', v); },
  setExpBottomSheet: (v) => { set({ expBottomSheet: v }); saveSetting('expBottomSheet', v); },
  setExpPeekAndPop: (v) => { set({ expPeekAndPop: v }); saveSetting('expPeekAndPop', v); },
  setExpLiquidTabBar: (v) => { set({ expLiquidTabBar: v }); saveSetting('expLiquidTabBar', v); },
  setExpBreadcrumbsNav: (v) => { set({ expBreadcrumbsNav: v }); saveSetting('expBreadcrumbsNav', v); },
  setExpSwipeBack: (v) => { set({ expSwipeBack: v }); saveSetting('expSwipeBack', v); },
  setExpMorphingSearch: (v) => { set({ expMorphingSearch: v }); saveSetting('expMorphingSearch', v); },
  setExpFocusBlur: (v) => { set({ expFocusBlur: v }); saveSetting('expFocusBlur', v); },
  setExpTypingIndicator: (v) => { set({ expTypingIndicator: v }); saveSetting('expTypingIndicator', v); },
  setExpPersonalizedSkeleton: (v) => { set({ expPersonalizedSkeleton: v }); saveSetting('expPersonalizedSkeleton', v); },
  setExpHoverElevation: (v) => { set({ expHoverElevation: v }); saveSetting('expHoverElevation', v); },
  setExpReadProgress: (v) => { set({ expReadProgress: v }); saveSetting('expReadProgress', v); },
  setExpCopyToast: (v) => { set({ expCopyToast: v }); saveSetting('expCopyToast', v); },
  setExpErrorShake: (v) => { set({ expErrorShake: v }); saveSetting('expErrorShake', v); },
  setExpEnhancedRipple: (v) => { set({ expEnhancedRipple: v }); saveSetting('expEnhancedRipple', v); },
  setExpDynamicGradient: (v) => { set({ expDynamicGradient: v }); saveSetting('expDynamicGradient', v); },
  setExpFrostGlass: (v) => { set({ expFrostGlass: v }); saveSetting('expFrostGlass', v); },
  setExpJustifyText: (v) => { set({ expJustifyText: v }); saveSetting('expJustifyText', v); },
  setExpEnhancedAnimations: (v) => { set({ expEnhancedAnimations: v }); saveSetting('expEnhancedAnimations', v); },
  setExpLowEndMode: (v) => { set({ expLowEndMode: v }); saveSetting('expLowEndMode', v); },
  setExpProgressiveRender: (v) => { set({ expProgressiveRender: v }); saveSetting('expProgressiveRender', v); },
  setExpFlipImageZoom: (v) => { set({ expFlipImageZoom: v }); saveSetting('expFlipImageZoom', v); },
  setExpKineticTypography: (v) => { set({ expKineticTypography: v }); saveSetting('expKineticTypography', v); },
  setExp3dTouch: (v) => { set({ exp3dTouch: v }); saveSetting('exp3dTouch', v); },
  setExpNativeScrollBounce: (v) => { set({ expNativeScrollBounce: v }); saveSetting('expNativeScrollBounce', v); },
  setExpNativePageTransition: (v) => { set({ expNativePageTransition: v }); saveSetting('expNativePageTransition', v); },
  setExpNativeHapticFeedback: (v) => { set({ expNativeHapticFeedback: v }); saveSetting('expNativeHapticFeedback', v); },
  setExpNativeContextMenu: (v) => { set({ expNativeContextMenu: v }); saveSetting('expNativeContextMenu', v); },
  setExpNativePullToRefresh: (v) => { set({ expNativePullToRefresh: v }); saveSetting('expNativePullToRefresh', v); },
  setLastResultCount: (n) => { set({ lastResultCount: n }); saveSetting('lastResultCount', n); },
  setHasCompletedSetup: (v) => { set({ hasCompletedSetup: v }); saveSetting('hasCompletedSetup', v); },
  addNotification: (n) => {
    const notifications = [{ id: Math.random().toString(36).substring(7), ...n, date: Date.now(), read: false }, ...get().notifications];
    set({ notifications });
    saveSetting('notifications', notifications);
  },
  markNotificationRead: (id) => {
    const notifications = get().notifications.map(n => n.id === id ? { ...n, read: true } : n);
    set({ notifications });
    saveSetting('notifications', notifications);
  },
  clearNotifications: () => { set({ notifications: [] }); saveSetting('notifications', []); },
  setActiveHomeCards: (v) => { set({ activeHomeCards: v }); saveSetting('activeHomeCards', v); },
  setWidgetSizes: (v) => { set({ widgetSizes: v }); saveSetting('widgetSizes', v); },
  setThirdPartyWidgets: (v) => { set({ thirdPartyWidgets: v }); saveSetting('thirdPartyWidgets', v); },
  setRssFeeds: (v) => { set({ rssFeeds: v }); saveSetting('rssFeeds', v); },
  setExpUseInvidious: (v) => { set({ expUseInvidious: v }); saveSetting('expUseInvidious', v); },
  setInvidiousInstance: (v) => { set({ invidiousInstance: v }); saveSetting('invidiousInstance', v); },
  setCustomInvidiousUrl: (v) => { set({ customInvidiousUrl: v }); saveSetting('customInvidiousUrl', v); },
  setExpNewsMarkdown: (v) => { set({ expNewsMarkdown: v }); saveSetting('expNewsMarkdown', v); },
  setMarkdownApiEndpoint: (v) => { set({ markdownApiEndpoint: v }); saveSetting('markdownApiEndpoint', v); },
  setMarkdownApiMethod: (v) => { set({ markdownApiMethod: v }); saveSetting('markdownApiMethod', v); },
  setSearchServerMode: (mode) => {
    set({ searchServerMode: mode });
    saveSetting('searchServerMode', mode);
    const { customSearchServer } = get();
    const url = mode === 'default' ? 'https://api.wholphin.net' : customSearchServer;
    import('@yunfie/search-js').then(m => m.init({ API_BASE: url, TIMEOUT: 20000 }));
  },
  setCustomSearchServer: (server) => {
    set({ customSearchServer: server });
    saveSetting('customSearchServer', server);
    if (get().searchServerMode === 'custom') {
      import('@yunfie/search-js').then(m => m.init({ API_BASE: server, TIMEOUT: 20000 }));
    }
  },
  setWorldClocks: (v) => { set({ worldClocks: v }); saveSetting('worldClocks', v); },
  addSearchLater: (q) => {
    const list = [...get().searchLaterList, { id: Math.random().toString(), q, time: Date.now() }];
    set({ searchLaterList: list });
    saveSetting('searchLaterList', list);
  },
  removeSearchLater: (id) => {
    const list = get().searchLaterList.filter((x) => x.id !== id);
    set({ searchLaterList: list });
    saveSetting('searchLaterList', list);
  },
  setGeminiApiKey: (key) => { set({ geminiApiKey: key }); saveSetting('geminiApiKey', key); },
  setGeminiFactCheckApiKey: (key) => { set({ geminiFactCheckApiKey: key }); saveSetting('geminiFactCheckApiKey', key); },

  performSearch: async (q, type, pageNum = 1) => {
    if (!q) return;
    const { resultsPerPage, searchLang } = get();
    const cacheKey = `${q}:${type}:${searchLang}:${resultsPerPage}:${pageNum}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      set({ query: q, type, page: pageNum, results: cached.results, pager: cached.pager, isInitialLoading: false, error: null });
      return;
    }
    const searchId = Math.random().toString(36).substring(7);
    (window as any)._lastSearchId = searchId;
    set({ query: q, type, page: pageNum, isInitialLoading: true, results: [], error: null });
    try {
      const pager = createPager({ q, type, lang: searchLang }, resultsPerPage);
      set({ pager });
      let result = null;
      for (let i = 0; i < pageNum; i++) { result = await pager.next(); }
      if ((window as any)._lastSearchId !== searchId) return;
      const data = result?.data as any;
      const items = Array.isArray(data) ? data : (data?.results || []);
      if (result && result.ok && items.length > 0) {
        set({ results: items, isInitialLoading: false });
        searchCache.set(cacheKey, { results: items, pager: pager });
        if (searchCache.size > 20) {
          const firstKey = searchCache.keys().next().value;
          if (firstKey !== undefined) searchCache.delete(firstKey);
        }
      } else { set({ results: [], error: result?.error || 'Search failed', isInitialLoading: false }); }
    } catch (e) {
      if ((window as any)._lastSearchId !== searchId) return;
      set({ results: [], error: 'An unexpected error occurred', isInitialLoading: false });
    }
  },
  resetSearch: () => { set({ results: [], pager: null, error: null, isInitialLoading: false, isLoading: false }); },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    clearHistory();
    const state = getInitialState();
    set({ ...state, triggerFullSync: get().triggerFullSync } as any);
  },
  exportData: () => {
    const history = getHistory();
    return JSON.stringify({ ...settingsCache, history });
  },
  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (typeof data !== 'object' || data === null) return false;
      
      const { history, ...settings } = data;
      
      // 設定の反映
      settingsCache = { ...initialState, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsCache));
      set(settingsCache as any);
      
      // 履歴の反映
      if (Array.isArray(history)) {
        clearHistory();
        // 簡易的に履歴を復元（@yunfie/search-js の実装に依存）
        localStorage.setItem('wholphin_history', JSON.stringify(history));
      }
      
      return true;
    } catch (e) { return false; }
  },

  setSyncGroupId: (id) => { 
    const finalId = id || Math.random().toString(36).substring(2, 10).toUpperCase();
    set({ syncGroupId: finalId }); 
    saveSetting('syncGroupId', finalId); 
  },
  setSyncServerUrl: (url) => { set({ syncServerUrl: url }); saveSetting('syncServerUrl', url); },
  setSyncServerMode: (mode) => { set({ syncServerMode: mode }); saveSetting('syncServerMode', mode); },
  setEnableSync: (v) => { set({ enableSync: v }); saveSetting('enableSync', v); },
  setDeviceName: (name) => { set({ deviceName: name }); saveSetting('deviceName', name); },
  setConnectedDevices: (devices) => set({ connectedDevices: devices }),
}));
