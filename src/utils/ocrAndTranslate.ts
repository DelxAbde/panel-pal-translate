
const LIBRETRANSLATE_API_URL = 'https://libretranslate.de/translate';

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const response = await fetch(LIBRETRANSLATE_API_URL, {
      method: 'POST',
      body: new URLSearchParams({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

export const performOCR = async (imageData: string): Promise<string> => {
  const Tesseract = (await import('tesseract.js')).default;

  try {
    console.log('Starting OCR process...');
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng+jpn');
    await worker.initialize('eng+jpn');
    
    console.log('Processing image with Tesseract...');
    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();
    
    console.log('OCR completed successfully');
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
};
