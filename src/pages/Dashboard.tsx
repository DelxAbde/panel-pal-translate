
import { useAuth } from "@/contexts/AuthContext";
import { TranslationForm } from "@/components/TranslationForm";
import { UserProfile } from "@/components/UserProfile";
import { TranslationProgress } from "@/components/TranslationProgress";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { currentJob } = useTranslation();
  
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Logo />
          
          <div className="flex items-center gap-2">
            <span className="text-sm hidden md:block">
              {user.username === "Guest" ? "Guest User" : user.username}
            </span>
            <Button 
              onClick={logout} 
              variant="ghost" 
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TranslationForm />
          </div>
          
          <div className="space-y-6">
            {currentJob ? <TranslationProgress /> : <UserProfile />}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-white/80 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Panel Pal Translator &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
