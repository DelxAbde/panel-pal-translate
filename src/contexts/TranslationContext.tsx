
import { createContext, useContext } from "react";
import { TranslationJob } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTranslationJobs } from "@/hooks/useTranslationJobs";
import { useTranslationService, ProgressStep } from "@/services/translationService";

type TranslationContextType = {
  jobs: TranslationJob[];
  currentJob: TranslationJob | null;
  startTranslation: (
    sourceLanguage: string,
    targetLanguage: string,
    font: string,
    fontSize: number,
    translationStyle: string,
    imageData?: string
  ) => Promise<void>;
  cancelTranslation: (jobId: string) => void;
  downloadTranslation: (jobId: string) => void;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const {
    jobs,
    currentJob,
    createJob,
    updateJobProgress,
    completeJob,
    failJob,
  } = useTranslationJobs();
  const { processTranslation } = useTranslationService();

  const startTranslation = async (
    sourceLanguage: string,
    targetLanguage: string,
    font: string,
    fontSize: number,
    translationStyle: string,
    imageData?: string
  ) => {
    if (!imageData) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload a manga image to translate",
        duration: 3000,
      });
      return;
    }

    const job = createJob(
      sourceLanguage,
      targetLanguage,
      font,
      fontSize,
      translationStyle,
      imageData
    );

    try {
      // Process the translation with detailed progress updates
      const progressHandler = (progress: ProgressStep) => {
        updateJobProgress(job.id, progress);
      };

      const result = await processTranslation(
        imageData,
        sourceLanguage,
        targetLanguage,
        progressHandler
      );

      // For now, we'll just display the original image as the result
      // In a future update, we'll implement the text rendering on the image
      completeJob(
        job.id,
        imageData, // Simply using the original image for now
        result.originalText,
        result.translatedText
      );
      
    } catch (error) {
      console.error("Translation failed", error);
      failJob(
        job.id,
        error instanceof Error ? error.message : "Translation failed. Please try again."
      );
    }
  };

  const cancelTranslation = (jobId: string) => {
    failJob(jobId, "Cancelled by user");
    toast({
      title: "Translation cancelled",
      description: "The translation job has been cancelled",
      duration: 3000,
    });
  };

  const downloadTranslation = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.resultData) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "No translation result available",
        duration: 3000,
      });
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = job.resultData;
      link.download = `translated_manga_${job.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your translated manga is being downloaded",
        duration: 3000,
      });
    } catch (error) {
      console.error("Download failed", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download the translated manga",
        duration: 3000,
      });
    }
  };

  const value = {
    jobs,
    currentJob,
    startTranslation,
    cancelTranslation,
    downloadTranslation,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};
