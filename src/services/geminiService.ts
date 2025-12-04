import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.warn("VITE_API_KEY is not set.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Cache keys prefix
const CACHE_KEY_PREFIX = 'gemini_cache_';

export const getSurahInsight = async (surahName: string, englishName: string, ayahCount: number): Promise<string> => {
  const cacheKey = `${CACHE_KEY_PREFIX}insight_${englishName}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const ai = getClient();
  if (!ai) return "خدمة الذكاء الاصطناعي غير متاحة. يرجى التحقق من مفتاح API.";

  try {
    const prompt = `
      قدم ملخصاً روحانياً وتفسيرياً موجزاً لـ ${surahName}.
      عدد آياتها: ${ayahCount}.
      
      نظم الإجابة كالتالي باللغة العربية:
      1. المحاور الرئيسية (نقاط).
      2. سياق النزول (بإيجاز).
      3. درس مستفاد للحياة المعاصرة.
      
      اجعل الأسلوب محترماً، علمياً، وملهمًا. التنسيق: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "لم يتم إنشاء محتوى.";
    
    // Save to cache
    if (response.text) {
        localStorage.setItem(cacheKey, text);
    }
    
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "تعذر جلب التفسير في الوقت الحالي.";
  }
};

export const getAyahExplanation = async (surahName: string, ayahNumber: number, ayahText: string): Promise<string> => {
  const cacheKey = `${CACHE_KEY_PREFIX}ayah_${surahName}_${ayahNumber}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const ai = getClient();
  if (!ai) return "الخدمة غير متاحة.";

  try {
    const prompt = `
      اشرح الآية التالية من ${surahName}، رقم الآية ${ayahNumber}:
      "${ayahText}"
      
      قدم تفسيراً موجزاً يوضح المعنى والحكمة منها باللغة العربية.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "لا يتوفر شرح حالياً.";

    // Save to cache
    if (response.text) {
        localStorage.setItem(cacheKey, text);
    }

    return text;
  } catch (error) {
    console.error("Gemini Ayah Error:", error);
    return "تعذر جلب الشرح.";
  }
};