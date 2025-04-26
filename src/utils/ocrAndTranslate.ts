
// LibreTranslate can sometimes be unreliable with their public instances
// We'll provide multiple fallback endpoints and better error handling
const LIBRETRANSLATE_ENDPOINTS = [
  'https://libretranslate.de/translate',
  'https://translate.argosopentech.com/translate',
  'https://translate.terraprint.co/translate'
];

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
        signal: AbortSignal.timeout(15000)
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

  // If we got here, all endpoints failed
  throw lastError || new Error('All translation endpoints failed');
};

export const performOCR = async (imageData: string): Promise<string> => {
  const Tesseract = (await import('tesseract.js')).default;

  try {
    console.log('Starting OCR process...');
    const worker = await Tesseract.createWorker();
    
    // Configure Tesseract for manga OCR
    // We'll use a combination of languages that works well for manga
    const languages = 'eng+jpn+chi_sim';
    await worker.loadLanguage(languages);
    await worker.initialize(languages);
    
    // Set parameters to improve OCR for manga text
    // Fix: Use numeric value instead of string for PSM
    await worker.setParameters({
      tessedit_pageseg_mode: 6, // Changed from '6' to 6 (numeric value)
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
    const endpoint = 'https://libretranslate.de/detect';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ q: text }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.statusText}`);
    }

    const detections = await response.json();
    if (!detections || !detections.length) {
      throw new Error('No language detection results');
    }

    // Return the language code with highest confidence
    return detections.sort((a: any, b: any) => b.confidence - a.confidence)[0].language;
  } catch (error) {
    console.error('Language detection error:', error);
    // Default to English on error
    return 'en';
  }
};
