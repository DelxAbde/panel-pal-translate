
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

  // Mock translation function - in a real app, this would call an OCR API
  const performOCRAndTranslation = async (
    imageData: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    // This is a placeholder for actual OCR and translation
    // In a real implementation, this would:
    // 1. Call an OCR API to extract text from the image
    // 2. Send the extracted text to a translation API
    // 3. Return the translated text
    
    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}`);
    
    // Simulating processing delay with more realistic steps
    await new Promise(resolve => setTimeout(resolve, 1500)); // OCR delay
    
    // For demo purposes, we're just returning the same image
    // In a real app, you would render the translated text back onto the image
    return imageData;
  };

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
      toast({
        title: "Translation started",
        description: "Your manga is being processed...",
        duration: 3000,
      });

      // Simulate translation process with progress updates and more realistic steps
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === newJob.id ? { ...job, progress, status: "processing" } : job
          )
        );
        
        setCurrentJob((prev) => 
          prev?.id === newJob.id ? { ...prev, progress, status: "processing" } : prev
        );

        // Add more detailed status messages based on progress
        if (progress === 10) {
          toast({
            title: "OCR Processing",
            description: "Detecting text in your manga...",
            duration: 2000,
          });
        } else if (progress === 40) {
          toast({
            title: "Translation",
            description: `Translating from ${sourceLanguage} to ${targetLanguage}...`,
            duration: 2000,
          });
        } else if (progress === 70) {
          toast({
            title: "Rendering",
            description: "Applying translations to your manga...",
            duration: 2000,
          });
        }

        if (progress >= 100) {
          clearInterval(interval);
          
          // Process translation when complete
          setTimeout(async () => {
            try {
              // In a real app, this would actually translate the image
              const resultData = await performOCRAndTranslation(
                imageData,
                sourceLanguage,
                targetLanguage
              );
              
              setJobs((prevJobs) =>
                prevJobs.map((job) =>
                  job.id === newJob.id
                    ? {
                        ...job,
                        progress: 100,
                        status: "completed",
                        resultData: resultData,
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
                      resultData: resultData,
                    }
                  : prev
              );
              
              toast({
                title: "Translation completed",
                description: "Your manga has been translated successfully!",
                duration: 3000,
              });
            } catch (error) {
              console.error("Error during translation processing:", error);
              handleTranslationError(newJob.id, "Error processing translation");
            }
          }, 1000);
        }
      }, 300); // Faster updates for a smoother experience
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
