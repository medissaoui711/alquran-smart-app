import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Ayah, SurahDetail } from '../types';
import { PlayIcon, PauseIcon, SparklesIcon, BookIcon, SunIcon, MoonIcon, ArrowRightIcon, BookmarkIcon, BookmarkSolidIcon, XMarkIcon } from './Icons';
import { getAyahExplanation } from '../services/geminiService';
import { useQuranStore, useSettingsStore, useUIStore } from '../store';

// Helper interface
interface FlatAyah extends Ayah {
  surahName: string;
  surahNumber: number;
  isFirstAyahOfSurah: boolean;
  surahRevelation: string;
}

const QuranPage = React.memo(({ 
    pageNumber, 
    ayahs, 
    playingAyahKey, 
    onAyahPlay,
    onAyahTafsir,
    setHoveredAyah,
    isLeftPage,
    isSingleView,
    fontSize,
    fontType
}: { 
    pageNumber: number;
    ayahs: FlatAyah[];
    playingAyahKey: string | null; 
    onAyahPlay: (surahNum: number, ayahNum: number) => void;
    onAyahTafsir: (e: React.MouseEvent, surahName: string, ayah: FlatAyah) => void;
    setHoveredAyah: (id: number | null) => void;
    isLeftPage: boolean;
    isSingleView: boolean;
    fontSize: number;
    fontType: string;
}) => {
    // Dynamic text sizing based on device width using clamps and viewport units
    const textStyle = {
        fontFamily: fontType,
        fontSize: `${isSingleView ? fontSize * 0.85 : fontSize}px`,
        lineHeight: '2.5',
    };

    return (
        <div className={`
            flex-1 bg-[#fffbf2] dark:bg-[#1c1917] h-full flex flex-col relative
            ${!isSingleView && isLeftPage ? 'rounded-l-lg md:rounded-l-2xl border-l border-stone-200 dark:border-stone-800' : ''}
            ${!isSingleView && !isLeftPage ? 'rounded-r-lg md:rounded-r-2xl border-r border-stone-200 dark:border-stone-800' : ''}
            ${isSingleView ? 'rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm' : ''}
            shadow-inner transition-colors duration-300 overflow-hidden select-none
        `}>
            {/* Page Header */}
            <div className="h-8 md:h-12 flex justify-between items-center px-4 md:px-6 text-[10px] md:text-xs text-stone-400 dark:text-stone-500 font-sans border-b border-stone-100 dark:border-stone-800/50 bg-stone-50/50 dark:bg-stone-900/50">
                <span>{ayahs[0]?.surahName}</span>
                <span className="font-bold text-stone-600 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-full">{pageNumber}</span>
                <span>الجزء {ayahs[0]?.juz}</span>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6 scrollbar-hide md:scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800 overscroll-contain">
                <div 
                    className="text-justify text-stone-800 dark:text-stone-200 transition-all duration-300" 
                    dir="rtl"
                    style={textStyle}
                >
                    {ayahs.map((ayah) => {
                        const uniqueKey = `${ayah.surahNumber}:${ayah.numberInSurah}`;
                        const isActive = playingAyahKey === uniqueKey;
                        const isBismillah = ayah.numberInSurah === 1 && ayah.surahNumber !== 1 && ayah.surahNumber !== 9;
                        const bismillahText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
                        
                        let displayText = ayah.text;
                        if (isBismillah) {
                            displayText = displayText.replace(bismillahText, '').trim();
                        }

                        return (
                            <React.Fragment key={uniqueKey}>
                                {ayah.isFirstAyahOfSurah && (
                                    <div className="w-full my-4 md:my-6 text-center select-none group">
                                        <div className="relative inline-block w-full py-2 md:py-3 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-opacity-10 bg-stone-100 dark:bg-stone-800/50 border-y-2 border-double border-emerald-700/30 dark:border-emerald-500/30 rounded-lg overflow-hidden">
                                            <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                                <h2 className="text-xl md:text-3xl font-amiri text-emerald-900 dark:text-emerald-100">{ayah.surahName}</h2>
                                                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">{ayah.surahRevelation === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                                            </div>
                                        </div>
                                        {ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && (
                                            <div className="mt-4 mb-2 font-scheherazade text-xl md:text-2xl text-stone-600 dark:text-stone-400">
                                                {bismillahText}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <span 
                                    className={`
                                        hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors duration-200 decoration-clone px-0.5 rounded leading-relaxed
                                        ${isActive ? 'bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100' : ''}
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAyahPlay(ayah.surahNumber, ayah.numberInSurah);
                                    }}
                                    onMouseEnter={() => setHoveredAyah(ayah.number)}
                                    onMouseLeave={() => setHoveredAyah(null)}
                                    title="اضغط للاستماع"
                                >
                                    {displayText}
                                </span>
                                <span 
                                    className="inline-flex items-center justify-center mx-1 select-none text-emerald-700 dark:text-emerald-500 align-middle relative h-[0.9em] w-[0.9em] cursor-help hover:scale-110 transition-transform" 
                                    style={{ fontSize: '0.9em' }}
                                    onClick={(e) => onAyahTafsir(e, ayah.surahName, ayah)}
                                    title="تفسير الآية"
                                >
                                    <svg viewBox="0 0 32 32" className="w-full h-full opacity-90">
                                        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                        <text x="16" y="20" textAnchor="middle" fontSize="12" fill="currentColor" className="font-sans font-bold">{ayah.numberInSurah.toLocaleString('ar-EG')}</text>
                                    </svg>
                                </span>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {!isSingleView && (
                 <div className={`absolute top-0 bottom-0 w-8 pointer-events-none z-10
                    ${isLeftPage ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'}
                    from-stone-400/10 to-transparent dark:from-black/40
                 `}></div>
            )}
        </div>
    );
});

const MushafView: React.FC = () => {
  // Use Stores
  const { loadedSurahs: surahs, loadNextSurah, initialPageToLoad, toggleBookmark, bookmarks, clearReader, isLoading } = useQuranStore();
  const { fontSize, fontType, isDarkMode, toggleDarkMode } = useSettingsStore();
  const { isMobile, openModal } = useUIStore();

  const isBookmarked = surahs.length > 0 && bookmarks.some(b => b.surahNumber === surahs[0].number);

  // Data Transformation
  const pages = useMemo(() => {
    const map = new Map<number, FlatAyah[]>();
    surahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            const pageNum = ayah.page;
            if (!map.has(pageNum)) map.set(pageNum, []);
            map.get(pageNum)!.push({
                ...ayah,
                surahName: surah.name,
                surahNumber: surah.number,
                isFirstAyahOfSurah: ayah.numberInSurah === 1,
                surahRevelation: surah.revelationType
            });
        });
    });
    return new Map<number, FlatAyah[]>([...map.entries()].sort((a, b) => a[0] - b[0]));
  }, [surahs]);

  // Refs to avoid stale closures in audio callbacks
  const surahsRef = useRef(surahs);
  surahsRef.current = surahs;
  
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const pageNumbers = Array.from(pages.keys()) as number[];

  // Initialize Page State
  const [currentRightPage, setCurrentRightPage] = useState<number>(() => {
     if (initialPageToLoad && pages.has(initialPageToLoad)) return initialPageToLoad;
     if (pageNumbers.length > 0) return pageNumbers[0];
     return 1;
  });

  // Effect: Reset or jump to specific page when `initialPageToLoad` changes or `pages` load
  useEffect(() => {
    if (initialPageToLoad && pages.has(initialPageToLoad)) {
        setCurrentRightPage(initialPageToLoad);
    } else if (pageNumbers.length > 0 && !pages.has(currentRightPage)) {
        setCurrentRightPage(pageNumbers[0]);
    }
  }, [initialPageToLoad, pages, pageNumbers]);

  // Effect: Persist exact reading position
  useEffect(() => {
      if (currentRightPage) {
          localStorage.setItem('quran_last_page', currentRightPage.toString());
      }
  }, [currentRightPage]);

  // Audio State & Refs
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingState, setPlayingState] = useState<{ surah: number, ayah: number } | null>(null);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null); // For pre-fetching
  const playAyahRef = useRef<(s: number, a: number) => void>(() => {});
  const audioContextRef = useRef<AudioContext | null>(null); // For Safari Unlock

  // Interaction State
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [popoverContent, setPopoverContent] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number} | null>(null);
  
  // Touch Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Safari Audio Unlock Logic
  const unlockAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  }, []);

  // One-time listener for first interaction
  useEffect(() => {
      const handleFirstInteraction = () => {
          unlockAudioContext();
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('click', handleFirstInteraction);
      return () => {
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('click', handleFirstInteraction);
      };
  }, [unlockAudioContext]);


  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') handlePrevPage();
          if (e.key === 'ArrowLeft') handleNextPage();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRightPage, isMobile, pageNumbers]);

  const handleNextPage = () => {
      const step = isMobile ? 1 : 2;
      const maxPage = Math.max(...pageNumbers);
      const nextPage = currentRightPage + step;
      if (nextPage > maxPage) {
          loadNextSurah();
      } else {
          setCurrentRightPage(nextPage);
      }
  };

  const handlePrevPage = () => {
      const step = isMobile ? 1 : 2;
      const prevPage = currentRightPage - step;
      if (prevPage >= Math.min(...pageNumbers)) {
          setCurrentRightPage(prevPage);
      }
  };

  // --- Touch Handlers ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      unlockAudioContext(); // Ensure audio unlocked on touch
  };

  const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;  // Dragging finger Left (<--)
      const isRightSwipe = distance < -minSwipeDistance; // Dragging finger Right (-->)

      if (isLeftSwipe) {
          handlePrevPage();
      }
      if (isRightSwipe) {
          handleNextPage();
      }
      
      setTouchStart(null);
      setTouchEnd(null);
  };

  // --- Audio Logic ---
  const stopAudio = useCallback(() => {
      if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
      }
      if (nextAudioRef.current) {
          nextAudioRef.current = null;
      }
      setIsPlaying(false);
  }, []);

  const preloadNextAyah = useCallback((surahNum: number, ayahNum: number) => {
      const currentSurah = surahsRef.current.find(s => s.number === surahNum);
      if (!currentSurah) return;

      let nextSurahNum = surahNum;
      let nextAyahNum = ayahNum + 1;

      // Check if we need to move to next Surah
      if (nextAyahNum > currentSurah.numberOfAyahs) {
          nextSurahNum = surahNum + 1;
          nextAyahNum = 1;
      }

      // Find URL for next Ayah from pages
      let targetAyah: FlatAyah | undefined;
      for (const pAyahs of pagesRef.current.values()) {
          const found = pAyahs.find(a => a.surahNumber === nextSurahNum && a.numberInSurah === nextAyahNum);
          if (found) {
              targetAyah = found;
              break;
          }
      }

      if (targetAyah) {
          const audio = new Audio(targetAyah.audio);
          audio.preload = 'auto';
          audio.load(); 
          nextAudioRef.current = audio;
      } else {
          nextAudioRef.current = null;
      }
  }, []);

  const playAyah = useCallback((surahNum: number, ayahNum: number) => {
      unlockAudioContext(); // Just in case

      // Find Ayah Data in current pages
      let targetAyah: FlatAyah | undefined;
      let foundPage = -1;

      for (const [pNum, pAyahs] of pagesRef.current.entries()) {
          const found = pAyahs.find(a => a.surahNumber === surahNum && a.numberInSurah === ayahNum);
          if (found) {
              targetAyah = found;
              foundPage = pNum;
              break;
          }
      }

      // If Ayah not found (e.g., end of loaded content)
      if (!targetAyah) {
          const maxLoadedSurah = Math.max(...surahsRef.current.map(s => s.number));
          // If requested surah is beyond what we have, try to load it
          if (surahNum > maxLoadedSurah) {
             loadNextSurah();
          }
          setIsPlaying(false);
          return;
      }

      // 1. Handle Page Flipping
      setCurrentRightPage(curr => {
        if (!isMobile) {
            const neededRightPage = foundPage % 2 !== 0 ? foundPage : foundPage - 1;
            return curr !== neededRightPage ? neededRightPage : curr;
        } else {
             return curr !== foundPage ? foundPage : curr;
        }
      });

      // 2. Handle Audio Object
      if (currentAudioRef.current) {
          currentAudioRef.current.pause();
      }

      let audio: HTMLAudioElement;
      
      // Check if preloaded audio matches the requested one
      if (nextAudioRef.current && nextAudioRef.current.src === targetAyah.audio) {
          audio = nextAudioRef.current;
          nextAudioRef.current = null; // Consume it
      } else {
          audio = new Audio(targetAyah.audio);
          audio.preload = 'auto';
      }

      currentAudioRef.current = audio;
      setPlayingState({ surah: surahNum, ayah: ayahNum });
      setIsPlaying(true);

      // 3. Preload the *next* verse immediately
      preloadNextAyah(surahNum, ayahNum);

      // 4. Setup Events
      audio.onended = () => {
          const surahInfo = surahsRef.current.find(s => s.number === surahNum);
          if (surahInfo) {
            if (ayahNum < surahInfo.numberOfAyahs) {
                // Next Ayah in same Surah
                playAyahRef.current(surahNum, ayahNum + 1);
            } else {
                // First Ayah of Next Surah
                playAyahRef.current(surahNum + 1, 1);
            }
          } else {
            setIsPlaying(false);
          }
      };

      audio.onerror = (e) => {
          console.error("Audio Playback Error", e);
          setIsPlaying(false);
      };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => {
              console.warn("Play prevented (User interaction needed on Safari):", e);
              setIsPlaying(false);
          });
      }

  }, [isMobile, loadNextSurah, preloadNextAyah, unlockAudioContext]); 

  // Keep ref updated
  useEffect(() => {
      playAyahRef.current = playAyah;
  }, [playAyah]);

  const togglePlay = useCallback(() => {
    unlockAudioContext();
    if (isPlaying) {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentAudioRef.current) {
          currentAudioRef.current.play();
          setIsPlaying(true);
      } else if (playingState) {
          playAyah(playingState.surah, playingState.ayah);
      } else {
          // Start from first ayah of current visible page
          const pageAyahs = pages.get(currentRightPage);
          if (pageAyahs && pageAyahs.length > 0) {
              const startAyah = pageAyahs[0];
              playAyah(startAyah.surahNumber, startAyah.numberInSurah);
          }
      }
    }
  }, [isPlaying, playingState, playAyah, pages, currentRightPage, unlockAudioContext]);

  // Clean up on unmount
  useEffect(() => {
      return () => {
          if (currentAudioRef.current) currentAudioRef.current.pause();
      };
  }, []);

  const handleAyahTafsir = useCallback(async (e: React.MouseEvent, surahName: string, ayah: FlatAyah) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY });
    setPopoverContent(null);
    const explanation = await getAyahExplanation(surahName, ayah.numberInSurah, ayah.text);
    setPopoverContent(explanation);
  }, []);

  const rightPageData = pages.get(currentRightPage);
  const leftPageNum = currentRightPage + 1;
  const leftPageData = pages.get(leftPageNum);

  if (surahs.length === 0) {
      return (
        <div className="flex-1 h-full flex items-center justify-center bg-[#fdfbf7] dark:bg-stone-950 p-8 text-center relative font-serif">
          <div className="max-w-md animate-pulse">
            <BookIcon className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
            <h2 className="text-2xl text-stone-600 dark:text-stone-300 mb-2">المصحف الشريف</h2>
            <p className="text-stone-400 dark:text-stone-500">جاري تحميل المصحف...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="flex-1 h-[100dvh] flex flex-col bg-[#eaddcf] dark:bg-[#0c0a09] relative overflow-hidden transition-colors duration-300" onClick={() => setPopoverContent(null)}>
      
      {/* Top Bar */}
      <div className="h-14 md:h-16 flex-shrink-0 bg-[#fdfbf7] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-3 md:px-6 flex justify-between items-center shadow-sm z-30">
         <div className="flex items-center gap-2 md:gap-3">
             {isMobile && (
                 <button onClick={clearReader} className="p-2 -mr-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"><ArrowRightIcon className="w-5 h-5 text-stone-600 dark:text-stone-300" /></button>
             )}
             <h1 className="text-lg md:text-xl font-bold font-amiri text-stone-800 dark:text-stone-100">المصحف الشريف</h1>
         </div>
         <div className="flex items-center gap-1 md:gap-2">
             <button onClick={() => toggleBookmark(surahs[0].number)} className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 ${isBookmarked ? 'text-emerald-500' : 'text-stone-400'}`}>
                 {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5"/> : <BookmarkIcon className="w-5 h-5"/>}
             </button>
             <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
                 {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
             </button>
             <button onClick={() => openModal('gemini')} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-xs md:text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                 <SparklesIcon className="w-4 h-4" />
                 <span className="hidden md:inline">تفسير</span>
             </button>
         </div>
      </div>

      {/* Book Container with Touch Handlers */}
      <div 
        className="flex-1 relative flex items-center justify-center p-2 md:p-8 overflow-hidden touch-pan-x"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          {/* Invisible Desktop Click Navigation Zones */}
          {!isMobile && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer hover:bg-black/5 transition-colors" onClick={handleNextPage} title="الصفحة التالية"></div>
                <div className="absolute right-0 top-0 bottom-0 w-[15%] z-20 cursor-pointer hover:bg-black/5 transition-colors" onClick={handlePrevPage} title="الصفحة السابقة"></div>
              </>
          )}

          {/* Book Wrapper */}
          <div className={`
              relative w-full md:max-w-6xl h-full shadow-2xl rounded-lg md:rounded-2xl flex overflow-hidden
              border-4 md:border-[8px] border-[#3e3025] dark:border-[#1a1816]
              bg-[#3e3025] dark:bg-[#1a1816]
          `}>
              {/* Right Page (Single Page on Mobile) */}
              <div className={`relative h-full ${isMobile ? 'w-full' : 'w-1/2'} z-10 bg-white dark:bg-[#1c1917]`}>
                  {rightPageData ? (
                      <QuranPage 
                        pageNumber={currentRightPage}
                        ayahs={rightPageData}
                        playingAyahKey={playingState ? `${playingState.surah}:${playingState.ayah}` : null}
                        onAyahPlay={playAyah}
                        onAyahTafsir={handleAyahTafsir}
                        setHoveredAyah={setHoveredAyah}
                        isLeftPage={false}
                        isSingleView={isMobile}
                        fontSize={fontSize}
                        fontType={fontType}
                      />
                  ) : (
                      <div className="h-full bg-[#fffbf2] dark:bg-[#1c1917] flex items-center justify-center">
                          <div className="text-stone-400">نهاية المصحف</div>
                      </div>
                  )}
              </div>

              {/* Spine (Desktop Only) */}
              {!isMobile && (
                  <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 z-20 pointer-events-none">
                      <div className="w-full h-full bg-gradient-to-r from-stone-900/10 via-stone-800/30 to-stone-900/10 dark:from-black/40 dark:via-black/60 dark:to-black/40 blur-sm"></div>
                  </div>
              )}

              {/* Left Page (Desktop Only) */}
              {!isMobile && (
                  <div className="relative h-full w-1/2 z-10 bg-white dark:bg-[#1c1917]">
                      {leftPageData ? (
                           <QuranPage 
                             pageNumber={leftPageNum}
                             ayahs={leftPageData}
                             playingAyahKey={playingState ? `${playingState.surah}:${playingState.ayah}` : null}
                             onAyahPlay={playAyah}
                             onAyahTafsir={handleAyahTafsir}
                             setHoveredAyah={setHoveredAyah}
                             isLeftPage={true}
                             isSingleView={false}
                             fontSize={fontSize}
                             fontType={fontType}
                           />
                      ) : (
                        <div className="h-full bg-[#fffbf2] dark:bg-[#1c1917] rounded-l-2xl flex items-center justify-center">
                            {/* Empty or Loading next */}
                        </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Sticky Player */}
      {(isPlaying || currentAudioRef.current) && playingState && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-stone-900/95 backdrop-blur rounded-full px-4 md:px-6 py-2 md:py-3 shadow-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 md:gap-6 z-50 min-w-[280px] justify-center animate-in slide-in-from-bottom-4 duration-300 mb-safe-bottom">
               {/* Previous Track */}
               <button 
                  onClick={() => {
                      if (playingState.ayah > 1) {
                          playAyah(playingState.surah, playingState.ayah - 1);
                      } else if (playingState.surah > 1) {
                           playAyah(playingState.surah - 1, 1);
                      }
                  }} 
                  className="hover:text-emerald-500 rotate-180 transition-colors"
               >
                   <ArrowRightIcon className="w-5 h-5" />
               </button>
               
               <button onClick={togglePlay} className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all">
                   {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6 ml-0.5"/>}
               </button>

               {/* Next Track */}
               <button 
                   onClick={() => {
                        const surahInfo = surahsRef.current.find(s => s.number === playingState.surah);
                        if (surahInfo && playingState.ayah < surahInfo.numberOfAyahs) {
                            playAyah(playingState.surah, playingState.ayah + 1);
                        } else {
                            playAyah(playingState.surah + 1, 1);
                        }
                   }}
                   className="hover:text-emerald-500 transition-colors"
                >
                    <ArrowRightIcon className="w-5 h-5" />
               </button>
               
               <div className="w-px h-8 bg-stone-300 dark:bg-stone-700 hidden md:block"></div>
               
               <div className="text-xs text-center hidden md:block cursor-default select-none">
                   <div className="font-bold text-stone-800 dark:text-stone-200">
                       سورة {surahsRef.current.find(s => s.number === playingState.surah)?.name}
                   </div>
                   <div className="text-stone-500">
                       الآية {playingState.ayah}
                   </div>
               </div>
          </div>
      )}

      {/* Tafsir Popover */}
      {popoverContent && popoverPosition && (
          <div 
            className="absolute z-[60] w-72 md:w-80 bg-white dark:bg-stone-800 p-4 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 text-sm animate-in fade-in zoom-in-95 duration-200 text-right"
            style={{ 
                left: isMobile ? '50%' : Math.min(popoverPosition.x - 150, window.innerWidth - 340), 
                top: isMobile ? '50%' : popoverPosition.y - 150,
                transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                position: 'fixed'
            }}
          >
              <h3 className="font-bold font-serif text-lg mb-2 border-b pb-2">تفسير الآية</h3>
              <div className="max-h-60 overflow-y-auto leading-relaxed opacity-90">{popoverContent}</div>
              <button onClick={() => setPopoverContent(null)} className="absolute top-2 left-2 p-1 hover:bg-stone-100 rounded-full"><XMarkIcon className="w-4 h-4"/></button>
          </div>
      )}
    </div>
  );
};

export default MushafView;