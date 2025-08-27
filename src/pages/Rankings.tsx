
import { useState, useEffect } from "react";
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://hoop-take-tracker.lovable.app/rankings`,
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
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Top 10 NBA Player Rankings</h1>
        <p className="text-muted-foreground mt-2">
          See the community&apos;s collective Top 10 and submit your own rankings.
        </p>
      </div>

      {/* Authentication status at the top */}
      {userId ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-800">
              Signed in as {userEmail}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 border rounded-md mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to create and save your Top 10 rankings
          </p>
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Google
          </Button>
        </div>
      )}

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
            <YourTopTen userId={userId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rankings;
