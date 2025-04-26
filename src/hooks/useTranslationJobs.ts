
import { useState } from "react";
import { TranslationJob } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { ProgressStep } from "@/services/translationService";

export const useTranslationJobs = () => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [currentJob, setCurrentJob] = useState<TranslationJob | null>(null);
  const { toast } = useToast();

  const createJob = (
    sourceLanguage: string,
    targetLanguage: string,
    font: string,
    fontSize: number,
    translationStyle: string,
    imageData: string
  ): TranslationJob => {
    const job: TranslationJob = {
      id: uuidv4(),
      status: "processing",
      progress: 0,
      sourceLanguage,
      targetLanguage,
      font,
      fontSize,
      translationStyle,
      imageData,
      createdAt: new Date().toISOString(),
    };

    setJobs((prevJobs) => [...prevJobs, job]);
    setCurrentJob(job);
    return job;
  };

  const updateJobProgress = (jobId: string, progressStep: ProgressStep) => {
    // Calculate overall progress based on the stage
    let overallProgress = 0;
    
    switch (progressStep.stage) {
      case 'ocr':
        // OCR is 0-40% of the overall process
        overallProgress = Math.floor(progressStep.progress * 0.4);
        break;
      case 'translation':
        // Translation is 40-80% of the overall process
        overallProgress = 40 + Math.floor(progressStep.progress * 0.4);
        break;
      case 'rendering':
        // Rendering is 80-100% of the overall process
        overallProgress = 80 + Math.floor(progressStep.progress * 0.2);
        break;
    }
    
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId 
          ? { 
              ...j, 
              progress: overallProgress,
              progressMessage: progressStep.message
            }
          : j
      )
    );
    
    setCurrentJob((prev) =>
      prev?.id === jobId
        ? { 
            ...prev, 
            progress: overallProgress,
            progressMessage: progressStep.message
          }
        : prev
    );
  };

  const completeJob = (jobId: string, resultData: string, originalText: string, translatedText: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              progress: 100,
              status: "completed",
              resultData,
              originalText,
              translatedText,
              completedAt: new Date().toISOString()
            }
          : j
      )
    );

    setCurrentJob((prev) =>
      prev?.id === jobId
        ? {
            ...prev,
            progress: 100,
            status: "completed",
            resultData,
            originalText,
            translatedText,
            completedAt: new Date().toISOString()
          }
        : prev
    );

    toast({
      title: "Translation completed",
      description: "Your manga has been translated successfully!",
      duration: 3000,
    });
  };

  const failJob = (jobId: string, error: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { 
              ...job, 
              status: "failed", 
              error,
              completedAt: new Date().toISOString()
            }
          : job
      )
    );
    
    setCurrentJob((prev) =>
      prev?.id === jobId 
        ? { 
            ...prev, 
            status: "failed", 
            error,
            completedAt: new Date().toISOString() 
          } 
        : prev
    );
    
    toast({
      variant: "destructive",
      title: "Translation failed",
      description: error,
      duration: 3000,
    });
  };

  return {
    jobs,
    currentJob,
    createJob,
    updateJobProgress,
    completeJob,
    failJob,
  };
};
