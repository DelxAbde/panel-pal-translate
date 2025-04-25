
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    document.title = "Panel Pal - Manga Translator";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <TranslationProvider>
          <Dashboard />
        </TranslationProvider>
      ) : (
        <AuthPage />
      )}
    </>
  );
};

export default Index;
