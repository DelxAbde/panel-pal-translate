
import { translateText, performOCR } from "@/utils/ocrAndTranslate";
import { useToast } from "@/hooks/use-toast";

export const useTranslationService = () => {
  const { toast } = useToast();

  const processTranslation = async (
    imageData: string,
    sourceLanguage: string,
    targetLanguage: string,
    onProgress: (progress: number) => void
  ) => {
    toast({
      title: "OCR Processing",
      description: "Detecting text in your manga...",
      duration: 2000,
    });

    const extractedText = await performOCR(imageData);
    onProgress(50);

    toast({
      title: "Translation",
      description: `Translating from ${sourceLanguage} to ${targetLanguage}...`,
      duration: 2000,
    });

    const translatedText = await translateText(
      extractedText,
      sourceLanguage,
      targetLanguage
    );

    return translatedText;
  };

  return {
    processTranslation,
  };
};
