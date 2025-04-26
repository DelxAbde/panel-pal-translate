
import { useState } from "react";
import { TranslationJob } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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
      status: "pending",
      progress: 0,
      sourceLanguage,
      targetLanguage,
      font,
      fontSize,
      translationStyle,
      imageData,
    };

    setJobs((prevJobs) => [...prevJobs, job]);
    setCurrentJob(job);
    return job;
  };

  const updateJobProgress = (jobId: string, progress: number) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId ? { ...j, progress } : j
      )
    );
  };

  const completeJob = (jobId: string, resultData: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              progress: 100,
              status: "completed",
              resultData
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
            resultData
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
          ? { ...job, status: "failed", error }
          : job
      )
    );
    
    setCurrentJob((prev) =>
      prev?.id === jobId ? { ...prev, status: "failed", error } : prev
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
