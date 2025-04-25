
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("manga_translator_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("manga_translator_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("manga_translator_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("manga_translator_user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      // For this demo, we'll just mock a successful login
      setTimeout(() => {
        const newUser: User = {
          id: `user_${Date.now()}`,
          username: email.split('@')[0],
          email,
          preferences: DEFAULT_PREFERENCES,
        };
        
        setUser(newUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${newUser.username}!`,
          duration: 3000,
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Login failed", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again",
        duration: 3000,
      });
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      // For this demo, we'll just mock a successful registration
      setTimeout(() => {
        const newUser: User = {
          id: `user_${Date.now()}`,
          username,
          email,
          preferences: DEFAULT_PREFERENCES,
        };
        
        setUser(newUser);
        toast({
          title: "Registration successful",
          description: `Welcome, ${username}!`,
          duration: 3000,
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again later",
        duration: 3000,
      });
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      duration: 3000,
    });
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      username: "Guest",
      preferences: DEFAULT_PREFERENCES,
    };
    
    setUser(guestUser);
    toast({
      title: "Welcome, Guest!",
      description: "You can create an account later to save your settings",
      duration: 3000,
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
