import React, { useEffect, useState } from 'react';
import { SurahDetail } from '../types';
import { getSurahInsight } from '../services/geminiService';
import { XMarkIcon, SparklesIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface GeminiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  surah: SurahDetail | null;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ isOpen, onClose, surah }) => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastSurahNumber, setLastSurahNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      if (isOpen && surah && surah.number !== lastSurahNumber) {
        setLoading(true);
        setInsight("");
        const text = await getSurahInsight(surah.name, surah.englishName, surah.numberOfAyahs);
        setInsight(text);
        setLoading(false);
        setLastSurahNumber(surah.number);
      }
    };

    fetchInsight();
  }, [isOpen, surah, lastSurahNumber]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel Positioned on the LEFT (opposite to RTL sidebar) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-[450px] bg-white dark:bg-stone-900 shadow-2xl transform transition-transform duration-300 ease-out border-r border-stone-200 dark:border-stone-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col text-right">
          {/* Header */}
          <div className="p-6 border-b border-indigo-100 dark:border-stone-800 bg-gradient-to-l from-indigo-50 to-white dark:from-stone-900 dark:to-stone-900 flex justify-between items-start">
             <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-left">
              <div className="flex items-center justify-end gap-2 text-indigo-700 dark:text-indigo-400 mb-1">
                <span className="font-bold text-sm tracking-wide font-sans">المرافق الذكي</span>
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100">
                {surah ? `${surah.name}` : 'اختر سورة'}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 dark:bg-stone-900">
            {!surah ? (
               <div className="flex items-center justify-center h-full text-stone-400 font-sans">
                 الرجاء فتح سورة لعرض التفسير.
               </div>
            ) : loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mr-auto"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded"></div>
                    <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded"></div>
                    <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-5/6"></div>
                </div>
                <div className="h-32 bg-stone-200 dark:bg-stone-800 rounded-lg"></div>
              </div>
            ) : (
              <div className="prose prose-stone dark:prose-invert prose-headings:font-serif prose-headings:text-emerald-800 dark:prose-headings:text-emerald-400 prose-p:text-stone-600 dark:prose-p:text-stone-300 prose-li:text-stone-600 dark:prose-li:text-stone-300 font-serif leading-loose" dir="rtl">
                 <ReactMarkdown>{insight}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-100 dark:border-stone-800 text-xs text-center text-stone-400 dark:text-stone-600 bg-white dark:bg-stone-900 font-sans">
            محتوى مولد بالذكاء الاصطناعي. يرجى التحقق من المصادر.
          </div>
        </div>
      </div>
    </>
  );
};

export default GeminiPanel;