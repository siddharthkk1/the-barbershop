
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CollectiveTopTen from "@/components/rankings/CollectiveTopTen";
import YourTopTen from "@/components/rankings/YourTopTen";

const Rankings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);

  // Authentication effect with debugging
  useEffect(() => {
    console.log("[Rankings] Setting up auth state listener");
    
    // Set up listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Rankings] Auth state changed:", { event, hasSession: !!session, userId: session?.user?.id });
      
      // Use setTimeout to ensure proper state updates
      setTimeout(() => {
        setUserId(session?.user?.id ?? null);
        setUserEmail(session?.user?.email ?? null);
        setAuthStateLoaded(true);
      }, 0);
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Rankings] Initial session check:", { hasSession: !!session, userId: session?.user?.id });
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
      setAuthStateLoaded(true);
    });

    return () => {
      console.log("[Rankings] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Use dynamic URL instead of hardcoded one
    const redirectUrl = `${window.location.origin}/rankings`;
    console.log("[Rankings] Google OAuth redirect URL:", redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    console.log("[Rankings] Signing out user");
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  // Add key prop based on auth state to force re-render
  const componentKey = `auth-${userId || 'anonymous'}-${authStateLoaded}`;

  // Authentication status component - rendered via portal
  const authStatusComponent = userId && authStateLoaded && (
    <div 
      className="fixed top-6 right-6 z-[99999]" 
      style={{ 
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-800 hidden sm:inline">
            {userEmail}
          </span>
          <span className="text-sm font-medium text-gray-800 sm:hidden">
            Signed in
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs h-8 px-3 hover:bg-gray-100">
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Render auth status using portal to ensure it's outside normal flow */}
      {typeof document !== 'undefined' && authStatusComponent && 
        createPortal(authStatusComponent, document.body)
      }

      <div key={componentKey} className="container mx-auto px-4 py-10 animate-fade-in relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Top 10 NBA Player Rankings</h1>
          <p className="text-muted-foreground mt-2">
            See the community&apos;s collective Top 10 and submit your own rankings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Collective Top 10</CardTitle>
              <CardDescription>Calculated from all user rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <CollectiveTopTen />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Top 10</CardTitle>
              <CardDescription>Create and manage your personal rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <YourTopTen 
                key={`your-top-ten-${componentKey}`}
                userId={userId}
                userEmail={userEmail}
                isLoading={isLoading}
                onGoogleSignIn={handleGoogleSignIn}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Rankings;
