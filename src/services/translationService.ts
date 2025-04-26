
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
      let extractedText;
      try {
        extractedText = await performOCR(imageData);
      } catch (ocrError) {
        console.error("OCR error:", ocrError);
        throw new Error("Text detection failed. Please try again with a clearer image.");
      }
      
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
        
        try {
          finalSourceLanguage = await detectLanguage(extractedText);
          
          toast({
            title: "Language Detected",
            description: `Detected language: ${finalSourceLanguage}`,
            duration: 2000,
          });
        } catch (detectError) {
          console.error("Language detection error:", detectError);
          // Default to English if detection fails
          finalSourceLanguage = 'en';
        }
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

      let translatedText;
      try {
        translatedText = await translateText(
          extractedText,
          finalSourceLanguage,
          targetLanguage
        );
      } catch (translationError) {
        console.error("Translation error:", translationError);
        // For this version, we'll just use the original text if translation fails
        // In a production app, you might want to show an error message
        translatedText = `[Translation failed] ${extractedText}`;
        
        toast({
          variant: "destructive",
          title: "Translation Issue",
          description: "Translation service is unavailable. Displaying original text.",
          duration: 3000,
        });
      }
      
      onProgress({
        stage: 'translation',
        progress: 100,
        message: "Translation complete"
      });
      
      // Step 4: Return the result
      return {
        originalText: extractedText,
        translatedText: translatedText || extractedText,
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
