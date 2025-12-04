import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MushafView from './components/MushafView';
import GeminiPanel from './components/GeminiPanel';
import HelpModal from './components/HelpModal';
import AboutModal from './components/AboutModal';
import AiTermsModal from './components/AiTermsModal';
import { useQuranStore, useSettingsStore, useUIStore } from './store';

function App() {
  // Access Stores
  const { fetchSurahList, loadedSurahs, error, selectedSurah } = useQuranStore();
  const { isDarkMode } = useSettingsStore();
  const { isMobile, setIsMobile, activeModal, closeModal } = useUIStore();

  // Initialize Data
  useEffect(() => {
    fetchSurahList();
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Handle Dark Mode Class (Backup sync)
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="flex h-[100dvh] bg-stone-100 dark:bg-stone-950 font-sans overflow-hidden transition-colors duration-300 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right" dir="rtl">
      
      {/* Sidebar View */}
      <div className={`
        ${isMobile ? (selectedSurah ? 'hidden' : 'flex-1') : 'w-96 flex-shrink-0 z-20 shadow-xl'}
        h-full
      `}>
         <Sidebar />
      </div>

      {/* Reader View */}
      <main className={`
        flex-1 flex flex-col h-full relative bg-[#fdfbf7] dark:bg-stone-950
        ${isMobile && !selectedSurah ? 'hidden' : ''}
      `}>
        {error ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center flex-col">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        ) : (
            <MushafView />
        )}
      </main>

      {/* Modals & Panels */}
      <GeminiPanel 
        isOpen={activeModal === 'gemini'} 
        onClose={closeModal} 
        surah={loadedSurahs.length > 0 ? loadedSurahs[0] : null} 
      />

      <HelpModal 
        isOpen={activeModal === 'help'}
        onClose={closeModal}
      />

      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={closeModal}
      />

      <AiTermsModal
        isOpen={activeModal === 'aiTerms'}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
