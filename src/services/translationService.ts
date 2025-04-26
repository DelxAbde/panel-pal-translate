
import { translateText, performOCR, detectLanguage } from "@/utils/ocrAndTranslate";
import { useToast } from "@/hooks/use-toast";

export type ProgressStep = {
  stage: 'ocr' | 'translation' | 'rendering';
  progress: number;
  message: string;
};

export const useTranslationService = () => {
  const { toast } = useToast();

  const processTranslation = async (
    imageData: string,
    sourceLanguage: string,
    targetLanguage: string,
    onProgress: (progress: ProgressStep) => void
  ) => {
    try {
      // Step 1: OCR Processing
      onProgress({
        stage: 'ocr',
        progress: 0,
        message: "Starting text detection..."
      });

      toast({
        title: "OCR Processing",
        description: "Detecting text in your manga...",
        duration: 2000,
      });

      // If source is 'auto', attempt to auto-detect the language after OCR
      const extractedText = await performOCR(imageData);
      
      onProgress({
        stage: 'ocr',
        progress: 100,
        message: "Text detection complete"
      });
      
      // Validate the extracted text
      if (!extractedText || !extractedText.trim()) {
        throw new Error("No text detected in the image. Try adjusting the image or selecting a different area.");
      }

      // Step 2: Auto-detect language if set to 'auto'
      let finalSourceLanguage = sourceLanguage;
      
      if (sourceLanguage === 'auto') {
        onProgress({
          stage: 'translation',
          progress: 10,
          message: "Detecting language..."
        });
        
        finalSourceLanguage = await detectLanguage(extractedText);
        
        toast({
          title: "Language Detected",
          description: `Detected language: ${finalSourceLanguage}`,
          duration: 2000,
        });
      }

      // Step 3: Translation
      onProgress({
        stage: 'translation',
        progress: 30,
        message: `Translating from ${finalSourceLanguage} to ${targetLanguage}...`
      });

      toast({
        title: "Translation",
        description: `Translating from ${finalSourceLanguage} to ${targetLanguage}...`,
        duration: 2000,
      });

      const translatedText = await translateText(
        extractedText,
        finalSourceLanguage,
        targetLanguage
      );
      
      onProgress({
        stage: 'translation',
        progress: 100,
        message: "Translation complete"
      });
      
      // Step 4: Return the result
      return {
        originalText: extractedText,
        translatedText: translatedText,
        detectedLanguage: finalSourceLanguage
      };
    } catch (error) {
      console.error("Translation service error:", error);
      throw error instanceof Error 
        ? error 
        : new Error("An unknown error occurred during translation");
    }
  };

  return {
    processTranslation,
  };
};
