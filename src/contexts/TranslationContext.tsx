
import { createContext, useContext, useState } from "react";
import { TranslationJob, User } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

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
      toast({
        title: "Translation started",
        description: "Your manga is being processed...",
        duration: 3000,
      });

      // Simulate translation process with progress updates
      // In a real app, this would call an API or use a library
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === newJob.id ? { ...job, progress, status: "processing" } : job
          )
        );
        
        setCurrentJob((prev) => 
          prev?.id === newJob.id ? { ...prev, progress, status: "processing" } : prev
        );

        if (progress >= 100) {
          clearInterval(interval);
          
          // Translation completed
          setTimeout(() => {
            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === newJob.id
                  ? {
                      ...job,
                      progress: 100,
                      status: "completed",
                      resultData: imageData, // In a real app, this would be the translated image
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
                    resultData: imageData, // In a real app, this would be the translated image
                  }
                : prev
            );
            
            toast({
              title: "Translation completed",
              description: "Your manga has been translated successfully!",
              duration: 3000,
            });
          }, 1000);
        }
      }, 500);
    } catch (error) {
      console.error("Translation failed", error);
      toast({
        variant: "destructive",
        title: "Translation failed",
        description: "An error occurred during translation",
        duration: 3000,
      });
    }
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
