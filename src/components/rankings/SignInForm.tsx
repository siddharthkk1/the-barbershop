
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const SignInForm = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  const handleSignInClick = () => {
    navigate("/auth");
  };

  if (isAuthed) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">You are signed in.</p>
        <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSignInClick}>
        Sign In / Create Account
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Create an account to save your rankings
      </p>
    </div>
  );
};

export default SignInForm;
