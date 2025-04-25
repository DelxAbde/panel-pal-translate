
const LIBRETRANSLATE_API_URL = 'https://libretranslate.de/translate';

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const response = await fetch(LIBRETRANSLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

// We'll use Tesseract.js for OCR
export const performOCR = async (imageData: string): Promise<string> => {
  // We need to add Tesseract.js as a dependency
  const Tesseract = (await import('tesseract.js')).default;

  try {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng+jpn');
    await worker.initialize('eng+jpn');
    
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
};
