
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

const GoogleSignInButton = ({ onSuccess, onError, disabled }: GoogleSignInButtonProps) => {
  const { toast } = useToast();
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    let canceled = false;

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
          return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.head.appendChild(script);
      });

    const handleCredentialResponse = async (response: any) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response?.credential,
        });

        if (error) {
          console.error("Supabase sign-in error:", error);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
          onError?.(error);
        } else {
          toast({
            title: "Welcome!",
            description: "Successfully signed in with Google",
          });
          onSuccess?.();
        }
      } catch (err) {
        console.error("Authentication error:", err);
        toast({
          title: "Authentication failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        onError?.(err);
      }
    };

    const initGoogle = async () => {
      try {
        // 1) Fetch client ID from Edge Function (uses Supabase secrets)
        const { data, error } = await supabase.functions.invoke<{ clientId: string }>("get-google-client-id");
        if (error) throw error;
        const clientId = data?.clientId;
        if (!clientId) {
          throw new Error("Google Client ID not available");
        }

        // 2) Ensure the GIS script is loaded
        await loadScript();
        if (canceled) return;

        // 3) Initialize and render the official button
        if (!window.google?.accounts?.id || isInitializedRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: buttonRef.current.clientWidth || 240,
          });
        }

        isInitializedRef.current = true;
      } catch (err: any) {
        console.error("Failed to initialize Google Sign-In:", err);
        toast({
          title: "Google Sign-In unavailable",
          description: err?.message ?? "Could not initialize the Google button.",
          variant: "destructive",
        });
        onError?.(err);
      }
    };

    initGoogle();

    return () => {
      canceled = true;
    };
  }, [onSuccess, onError, toast]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className={`w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Using Google Client ID configured in Supabase
      </div>
    </div>
  );
};

export default GoogleSignInButton;
