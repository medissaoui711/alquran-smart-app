
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookIcon, SearchIcon, DotsVerticalIcon, XMarkIcon, InfoIcon, BookmarkSolidIcon, PlusIcon, MinusIcon, SwatchIcon, QuestionMarkIcon, ShieldCheckIcon } from './Icons';
import { useQuranStore, useSettingsStore, useUIStore } from '../store';

const Sidebar: React.FC = () => {
  // Use Stores
  const { surahs, bookmarks, selectedSurah, loadSingleSurah, resumeLastRead } = useQuranStore();
  const { fontSize, setFontSize, fontType, setFontType } = useSettingsStore();
  const { isMobile, isSidebarOpen, openModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const juzStartSurah: Record<number, number> = {
    1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 11, 13: 12, 14: 15, 15: 17, 16: 18, 17: 21, 18: 23, 19: 25, 20: 27,
    21: 29, 22: 33, 23: 36, 24: 39, 25: 41, 26: 46, 27: 51, 28: 58, 29: 67, 30: 78
  };

  const filteredSurahs = useMemo(() => {
    if (activeTab === 'bookmarks') {
        const bookmarkedIds = new Set(bookmarks.map(b => b.surahNumber));
        return surahs.filter(s => bookmarkedIds.has(s.number));
    }
    if (searchQuery.trim() === '') return surahs;
    return surahs.filter(s => 
        s.name.includes(searchQuery) || 
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery, activeTab, bookmarks]);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleJuzClick = (juzNumber: number) => {
    const surahNumber = juzStartSurah[juzNumber];
    const surah = surahs.find(s => s.number === surahNumber);
    if (surah) {
        loadSingleSurah(surah);
    }
  };

  if (isMobile && !isSidebarOpen) return null; // Logic check, although App.tsx handles visibility mainly

  return (
    <div className={`w-full bg-[#1f1f1f] flex flex-col h-full text-stone-100 font-sans transition-all duration-300 relative border-l border-stone-800`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-[#1f1f1f] shadow-sm relative z-20">
        {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-200">
                <SearchIcon className="w-5 h-5 text-emerald-400" />
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="ابحث عن سورة..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-stone-500 font-sans"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchClose} className="p-1 hover:bg-white/10 rounded-full">
                    <XMarkIcon className="w-5 h-5 text-stone-400" />
                </button>
            </div>
        ) : (
            <>
                <h2 className="text-xl font-bold font-serif text-white tracking-wide">القرآن الكريم</h2>
                <div className="flex items-center gap-3 text-stone-300">
                    <button 
                        onClick={resumeLastRead}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="أكمل القراءة / المصحف"
                    >
                        <BookIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => {
                            setIsSearchOpen(true);
                            setActiveTab('surahs');
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="بحث"
                    >
                        <SearchIcon className="w-6 h-6" />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="خيارات"
                        >
                            <DotsVerticalIcon className="w-6 h-6" />
                        </button>
                        
                        {/* Dropdown Menu & Settings */}
                        {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-64 bg-[#2a2a2a] rounded-xl shadow-2xl border border-stone-700 overflow-hidden z-50 origin-top-left animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-4 border-b border-white/5">
                                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <SwatchIcon className="w-4 h-4" />
                                        إعدادات القراءة
                                    </h3>
                                    
                                    {/* Font Size */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-stone-300">حجم الخط</span>
                                        <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-lg p-1 border border-stone-700">
                                            <button 
                                                onClick={() => setFontSize(Math.max(20, fontSize - 2))}
                                                className="p-1.5 hover:bg-white/10 rounded text-stone-400 hover:text-white transition-colors"
                                            >
                                                <MinusIcon className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-emerald-400">{fontSize}</span>
                                            <button 
                                                onClick={() => setFontSize(Math.min(44, fontSize + 2))}
                                                className="p-1.5 hover:bg-white/10 rounded text-stone-400 hover:text-white transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Font Type */}
                                    <div className="space-y-2">
                                        <span className="text-sm text-stone-300 block">نوع الخط</span>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'Amiri', label: 'الخط الأميري' },
                                                { id: 'Scheherazade New', label: 'حفص (تقليدي)' },
                                                { id: 'Lateef', label: 'خط لطيف' }
                                            ].map((font) => (
                                                <button
                                                    key={font.id}
                                                    onClick={() => setFontType(font.id)}
                                                    className={`
                                                        px-3 py-2 rounded-lg text-right text-sm transition-all border
                                                        ${fontType === font.id 
                                                            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                                                            : 'bg-[#1f1f1f] border-stone-700 text-stone-400 hover:border-stone-500'
                                                        }
                                                    `}
                                                    style={{ fontFamily: font.id }}
                                                >
                                                    {font.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        openModal('help');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-right px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-stone-300 transition-colors border-b border-white/5"
                                >
                                    <QuestionMarkIcon className="w-4 h-4 text-emerald-500" />
                                    <span>طريقة الاستخدام</span>
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        openModal('aiTerms');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-right px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-stone-300 transition-colors border-b border-white/5"
                                >
                                    <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                                    <span>شروط الذكاء الاصطناعي</span>
                                </button>

                                <button 
                                    onClick={() => {
                                        openModal('about');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-right px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-stone-300 transition-colors"
                                >
                                    <InfoIcon className="w-4 h-4 text-stone-500" />
                                    <span>عن التطبيق</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#1f1f1f] border-b border-stone-700/50">
        <button 
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'surahs' ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-300'}`}
        >
            السور
            {activeTab === 'surahs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'juz' ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-300'}`}
        >
            الأجزاء
            {activeTab === 'juz' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'bookmarks' ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-300'}`}
        >
            الإشارات
            {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#1f1f1f] scrollbar-thin scrollbar-thumb-stone-700">
        {activeTab === 'juz' ? (
            <div className="p-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                    <button
                        key={juz}
                        onClick={() => handleJuzClick(juz)}
                        className="w-full flex items-center justify-between p-4 mb-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg border border-stone-800 transition-all text-right group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold font-serif text-lg group-hover:bg-emerald-900/50 transition-colors">
                                {juz}
                            </div>
                            <div>
                                <span className="block text-stone-100 font-bold">الجزء {juz}</span>
                                <span className="text-xs text-stone-500">بداية من {surahs.find(s => s.number === juzStartSurah[juz])?.name}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            <>
                {activeTab === 'bookmarks' && filteredSurahs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-500 text-center p-8">
                        <BookmarkSolidIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>لا توجد سور محفوظة حالياً</p>
                    </div>
                )}

                {filteredSurahs.map((surah, index) => (
                    <div key={surah.number}>
                        {activeTab === 'surahs' && index % 20 === 0 && index !== 0 && !searchQuery && (
                             <div className="bg-[#2a2a2a] px-4 py-2 text-stone-400 text-xs font-bold uppercase tracking-widest border-y border-stone-800">
                                مجموعة {Math.floor(index / 20) + 1}
                            </div>
                        )}
                        <button
                            onClick={() => loadSingleSurah(surah)}
                            className={`w-full text-right p-4 flex items-center gap-4 transition-colors duration-200 border-b border-white/5
                                ${selectedSurah?.number === surah.number ? 'bg-emerald-900/20' : 'hover:bg-[#2a2a2a]'}
                            `}
                        >
                            <div className="text-lg font-sans text-stone-500 font-medium w-8 text-center">
                                {surah.number}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-lg font-bold font-serif ${selectedSurah?.number === surah.number ? 'text-emerald-400' : 'text-stone-100'}`}>
                                        {surah.name.replace('سُورَةُ ', '')}
                                    </span>
                                    <span className={`text-sm ${selectedSurah?.number === surah.number ? 'text-emerald-400' : 'text-stone-100'}`}>
                                        {surah.englishName}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-stone-500 font-sans">
                                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</span>
                                </div>
                            </div>
                        </button>
                    </div>
                ))}
            </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
