
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const { toast } = useToast();

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

  const handleSendLink = async () => {
    if (!email) return;
    setIsSending(true);
    console.log("[Auth] Sending magic link to:", email);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/rankings`,
      },
    });
    setIsSending(false);
    if (error) {
      console.error("[Auth] signInWithOtp error:", error);
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Check your email", description: "We sent you a magic sign-in link." });
    setEmail("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
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
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleSendLink} disabled={isSending || !email}>
        {isSending ? "Sending..." : "Send magic link"}
      </Button>
    </div>
  );
};

export default SignInForm;
