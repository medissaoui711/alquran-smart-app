import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Surah, SurahDetail, Bookmark } from './types';
import { fetchSurahDetails, fetchSurahList } from './services/quranService';

// --- Settings Store ---
interface SettingsState {
  isDarkMode: boolean;
  fontSize: number;
  fontType: string;
  toggleDarkMode: () => void;
  setFontSize: (size: number) => void;
  setFontType: (type: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      fontSize: 26,
      fontType: 'Amiri',
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { isDarkMode: newMode };
      }),
      setFontSize: (size) => set({ fontSize: size }),
      setFontType: (type) => set({ fontType: type }),
    }),
    {
      name: 'quran_settings',
      onRehydrateStorage: () => (state) => {
          if (state?.isDarkMode) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
      }
    }
  )
);

// --- UI Store ---
interface UIState {
  isSidebarOpen: boolean;
  activeModal: 'none' | 'help' | 'about' | 'aiTerms' | 'gemini';
  toggleSidebar: () => void;
  openModal: (modal: 'help' | 'about' | 'aiTerms' | 'gemini') => void;
  closeModal: () => void;
  isMobile: boolean;
  isTablet: boolean; // New detection
  setIsMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeModal: 'none',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
  isMobile: window.innerWidth < 768,
  isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
  setIsMobile: (isMobile) => set({ 
    isMobile, 
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024 
  }),
}));

// --- Quran Data Store ---
interface QuranState {
  surahs: Surah[];
  loadedSurahs: SurahDetail[];
  selectedSurah: Surah | null;
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  initialPageToLoad: number | null;
  
  // Actions
  fetchSurahList: () => Promise<void>;
  loadSingleSurah: (surah: Surah, startPage?: number | null) => Promise<void>;
  loadNextSurah: () => Promise<void>;
  toggleBookmark: (surahNumber: number) => void;
  resumeLastRead: () => void;
  clearReader: () => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      surahs: [],
      loadedSurahs: [],
      selectedSurah: null,
      bookmarks: [],
      isLoading: false,
      error: null,
      initialPageToLoad: null,

      fetchSurahList: async () => {
        try {
          const data = await fetchSurahList();
          set({ surahs: data, error: null });
        } catch (err) {
          set({ error: "تعذر تحميل قائمة السور. يرجى التحقق من الاتصال." });
        }
      },

      loadSingleSurah: async (surah, startPage = null) => {
        set({ isLoading: true, selectedSurah: surah, error: null, loadedSurahs: [], initialPageToLoad: startPage });
        localStorage.setItem('quran_last_read', surah.number.toString());

        try {
          const detail = await fetchSurahDetails(surah.number);
          if (detail) {
            set({ loadedSurahs: [detail] });
          }
        } catch (error) {
          set({ error: "حدث خطأ أثناء تحميل السورة." });
        } finally {
          set({ isLoading: false });
        }
      },

      loadNextSurah: async () => {
        const { loadedSurahs, isLoading } = get();
        if (loadedSurahs.length === 0 || isLoading) return;

        const lastSurah = loadedSurahs[loadedSurahs.length - 1];
        if (lastSurah.number >= 114) return;

        const nextSurahNumber = lastSurah.number + 1;
        if (loadedSurahs.some(s => s.number === nextSurahNumber)) return;

        try {
          const detail = await fetchSurahDetails(nextSurahNumber);
          if (detail) {
            set((state) => ({ loadedSurahs: [...state.loadedSurahs, detail] }));
          }
        } catch (error) {
          console.error("Failed to load next surah");
        }
      },

      toggleBookmark: (surahNumber) => {
        set((state) => {
          const exists = state.bookmarks.some(b => b.surahNumber === surahNumber);
          let newBookmarks;
          if (exists) {
            newBookmarks = state.bookmarks.filter(b => b.surahNumber !== surahNumber);
          } else {
            newBookmarks = [...state.bookmarks, { surahNumber, addedAt: Date.now() }];
          }
          return { bookmarks: newBookmarks };
        });
      },

      resumeLastRead: () => {
        const { surahs } = get();
        if (surahs.length === 0) return;

        const lastReadId = localStorage.getItem('quran_last_read');
        const lastReadPage = localStorage.getItem('quran_last_page');
        
        let targetSurah: Surah | undefined;
        if (lastReadId) {
          targetSurah = surahs.find(s => s.number === parseInt(lastReadId));
        }
        if (!targetSurah) {
          targetSurah = surahs.find(s => s.number === 1);
        }

        if (targetSurah) {
          get().loadSingleSurah(targetSurah, lastReadPage ? parseInt(lastReadPage) : null);
        }
      },

      clearReader: () => {
        set({ selectedSurah: null, loadedSurahs: [] });
      }
    }),
    {
      name: 'quran_data_store',
      partialize: (state) => ({ bookmarks: state.bookmarks }),
    }
  )
);