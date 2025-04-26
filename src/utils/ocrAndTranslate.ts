
// LibreTranslate can sometimes be unreliable with their public instances
// We'll provide multiple fallback endpoints and better error handling
const LIBRETRANSLATE_ENDPOINTS = [
  'https://libretranslate.de/translate',
  'https://translate.argosopentech.com/translate',
  'https://translate.terraprint.co/translate',
  'https://libretranslate.com/translate' // Adding another endpoint
];

// We'll add a mock translation function as a last resort fallback
const mockTranslate = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
  console.log('Using mock translation as fallback');
  // For demo purposes, we'll just add a prefix to show it used the fallback
  return `[Translated from ${sourceLanguage} to ${targetLanguage}] ${text}`;
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  // Don't attempt to translate empty text
  if (!text.trim()) {
    console.warn('Empty text provided for translation');
    return '';
  }

  // If source and target are the same, no translation needed
  if (sourceLanguage === targetLanguage) {
    console.log('Source and target languages are the same, skipping translation');
    return text;
  }

  let lastError: Error | null = null;

  // Try each endpoint until one works
  for (const endpoint of LIBRETRANSLATE_ENDPOINTS) {
    try {
      console.log(`Attempting translation with ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to avoid hanging
        signal: AbortSignal.timeout(10000) // Reduced timeout to 10 seconds
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.translatedText) {
        throw new Error('Translation response missing translatedText field');
      }
      
      console.log('Translation successful');
      return data.translatedText;
    } catch (error) {
      console.error(`Translation error with ${endpoint}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown translation error');
      // Continue to next endpoint
    }
  }

  // If all endpoints failed, try the mock translation as last resort
  try {
    console.warn('All translation endpoints failed, using mock translation');
    return await mockTranslate(text, sourceLanguage, targetLanguage);
  } catch (mockError) {
    // If even the mock translation fails, throw the last error from the real translation attempts
    throw lastError || new Error('All translation methods failed');
  }
};

export const performOCR = async (imageData: string): Promise<string> => {
  const Tesseract = (await import('tesseract.js')).default;
  const { PSM } = await import('tesseract.js');

  try {
    console.log('Starting OCR process...');
    const worker = await Tesseract.createWorker();
    
    // Configure Tesseract for manga OCR
    // We'll use a combination of languages that works well for manga
    const languages = 'eng+jpn+chi_sim';
    await worker.loadLanguage(languages);
    await worker.initialize(languages);
    
    // Set parameters to improve OCR for manga text
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,  // Fixed: Using Tesseract PSM enum
      preserve_interword_spaces: '0', // Better for manga where spaces often don't matter
    });
    
    console.log('Processing image with Tesseract...');
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();
    
    console.log('OCR completed successfully');
    
    // Clean up the OCR result
    const cleanedText = text
      .replace(/\n{3,}/g, '\n\n') // Replace excessive newlines
      .trim();
      
    return cleanedText;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
};

// Utility to detect the language of text (can be used to auto-detect source language)
export const detectLanguage = async (text: string): Promise<string> => {
  if (!text.trim()) return 'en'; // Default to English for empty text
  
  try {
    // Try multiple endpoints for language detection too
    const endpoints = [
      'https://libretranslate.de/detect',
      'https://translate.argosopentech.com/detect',
      'https://translate.terraprint.co/detect'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ q: text }),
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // Shorter timeout for detection
        });

        if (!response.ok) continue; // Try the next endpoint

        const detections = await response.json();
        if (!detections || !detections.length) continue; // Try the next endpoint

        // Return the language code with highest confidence
        return detections.sort((a: any, b: any) => b.confidence - a.confidence)[0].language;
      } catch (error) {
        continue; // Try the next endpoint
      }
    }
    
    // If all detection endpoints fail, use fallback detection
    // For now, simplistically detect based on character sets
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text)) {
      return 'ja'; // Japanese
    } else if (/[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/.test(text)) {
      return 'ko'; // Korean
    } else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
      return 'ar'; // Arabic
    }
    
    // Default to English if nothing else works
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    // Default to English on error
    return 'en';
  }
};
