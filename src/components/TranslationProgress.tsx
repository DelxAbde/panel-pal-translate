
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";

export function TranslationProgress() {
  const { currentJob, cancelTranslation, downloadTranslation } = useTranslation();
  
  if (!currentJob) {
    return null;
  }
  
  const isCompleted = currentJob.status === "completed";
  const isFailed = currentJob.status === "failed";
  const isProcessing = currentJob.status === "processing" || currentJob.status === "pending";
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Translation {isCompleted ? "Complete" : (isFailed ? "Failed" : "Progress")}</span>
          {isProcessing && (
            <Button 
              variant="ghost"
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => cancelTranslation(currentJob.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing && (
          <>
            <div className="flex justify-between text-sm mb-1">
              <span>Processing...</span>
              <span>{currentJob.progress}%</span>
            </div>
            <Progress value={currentJob.progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {currentJob.progress < 30 && "Detecting text..."}
              {currentJob.progress >= 30 && currentJob.progress < 60 && "Translating content..."}
              {currentJob.progress >= 60 && currentJob.progress < 90 && "Rendering translation..."}
              {currentJob.progress >= 90 && "Finalizing..."}
            </p>
          </>
        )}
        
        {isCompleted && currentJob.resultData && (
          <div className="space-y-4">
            <img 
              src={currentJob.resultData} 
              alt="Translated manga" 
              className="max-h-[400px] mx-auto rounded-md"
            />
          </div>
        )}
        
        {isFailed && (
          <div className="text-center py-4">
            <p className="text-destructive">{currentJob.error || "Translation failed"}</p>
          </div>
        )}
      </CardContent>
      {isCompleted && (
        <CardFooter>
          <Button 
            onClick={() => downloadTranslation(currentJob.id)}
            className="w-full bg-manga-primary hover:bg-manga-secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Translation
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
