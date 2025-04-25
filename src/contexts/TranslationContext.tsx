import { createContext, useContext, useState } from "react";
import { TranslationJob } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { translateText, performOCR } from "@/utils/ocrAndTranslate";

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
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [currentJob, setCurrentJob] = useState<TranslationJob | null>(null);
  const { toast } = useToast();

  const startTranslation = async (
    sourceLanguage: string,
    targetLanguage: string,
    font: string,
    fontSize: number,
    translationStyle: string,
    imageData?: string
  ) => {
    try {
      if (!imageData) {
        toast({
          variant: "destructive",
          title: "No image selected",
          description: "Please upload a manga image to translate",
          duration: 3000,
        });
        return;
      }

      // Create a new job
      const newJob: TranslationJob = {
        id: uuidv4(),
        status: "pending",
        progress: 0,
        sourceLanguage,
        targetLanguage,
        font,
        fontSize,
        translationStyle,
        imageData,
      };

      setJobs((prevJobs) => [...prevJobs, newJob]);
      setCurrentJob(newJob);

      // Start OCR
      toast({
        title: "OCR Processing",
        description: "Detecting text in your manga...",
        duration: 2000,
      });

      const extractedText = await performOCR(imageData);
      
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === newJob.id ? { ...job, progress: 50 } : job
        )
      );

      // Translate the extracted text
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

      // For now, we'll just store the translated text
      // In a real implementation, you would render this back onto the image
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === newJob.id
            ? {
                ...job,
                progress: 100,
                status: "completed",
                resultData: translatedText
              }
            : job
        )
      );

      setCurrentJob((prev) =>
        prev?.id === newJob.id
          ? {
              ...prev,
              progress: 100,
              status: "completed",
              resultData: translatedText
            }
          : prev
      );

      toast({
        title: "Translation completed",
        description: "Your manga has been translated successfully!",
        duration: 3000,
      });

    } catch (error) {
      console.error("Translation failed", error);
      handleTranslationError(newJob.id, "Translation failed. Please try again.");
    }
  };

  const handleTranslationError = (jobId: string, errorMessage: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: "failed", error: errorMessage }
          : job
      )
    );
    
    setCurrentJob((prev) =>
      prev?.id === jobId ? { ...prev, status: "failed", error: errorMessage } : prev
    );
    
    toast({
      variant: "destructive",
      title: "Translation failed",
      description: errorMessage,
      duration: 3000,
    });
  };

  const cancelTranslation = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: "failed", error: "Cancelled by user" }
          : job
      )
    );
    
    setCurrentJob((prev) =>
      prev?.id === jobId ? null : prev
    );
    
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
      // Create a download link
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
