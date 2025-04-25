
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/contexts/TranslationContext";
import { Download } from "lucide-react";

export function UserProfile() {
  const { user, logout } = useAuth();
  const { jobs, downloadTranslation } = useTranslation();
  
  if (!user) return null;
  
  const completedJobs = jobs.filter(job => job.status === "completed");
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {user.username === "Guest" ? "Guest Profile" : `${user.username}'s Profile`}
        </CardTitle>
        <CardDescription>
          {user.email ? user.email : "Continue to create an account to save your settings"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Translation History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <div className="py-4 space-y-4">
              <h3 className="font-medium text-lg">Recent Translations</h3>
              {completedJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No translations yet
                </p>
              ) : (
                <div className="space-y-3">
                  {completedJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="flex justify-between items-center border rounded-md p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {LANGUAGES.find(l => l.code === job.sourceLanguage)?.name} to {" "}
                          {LANGUAGES.find(l => l.code === job.targetLanguage)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => downloadTranslation(job.id)}
                        className="bg-manga-primary hover:bg-manga-secondary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="py-4 space-y-4">
              <h3 className="font-medium text-lg">Account</h3>
              {user.username === "Guest" ? (
                <p className="text-muted-foreground">
                  Create an account to save your settings and translation history
                </p>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Username:</span> {user.username}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {user.email}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={logout} 
          variant="outline" 
          className="w-full"
        >
          {user.username === "Guest" ? "Back to Login" : "Sign Out"}
        </Button>
      </CardFooter>
    </Card>
  );
}
