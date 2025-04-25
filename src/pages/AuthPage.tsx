
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm, RegisterForm, GuestButton } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md mx-auto mb-8">
        <Logo size="lg" className="mx-auto" />
        <p className="text-center text-muted-foreground mt-2">
          Translate manga and manhwa with ease
        </p>
      </div>
      
      <div className="w-full max-w-md mx-auto">
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue without an account
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <GuestButton />
          </div>
        </div>
      </div>
    </div>
  );
}
