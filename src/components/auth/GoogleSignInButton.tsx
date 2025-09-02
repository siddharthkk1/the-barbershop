
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
    const initializeGoogleSignIn = () => {
      if (!window.google || isInitializedRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID", // This needs to be replaced with actual client ID
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
          });
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
        onError?.(error);
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
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
      } catch (error) {
        console.error("Authentication error:", error);
        toast({
          title: "Authentication failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        onError?.(error);
      }
    };

    // Check if Google Identity Services is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
      }, 10000);
    }
  }, [onSuccess, onError, toast]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className={`w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
      {/* Fallback for when Google Sign-In is not available */}
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Note: Google Client ID needs to be configured in production
      </div>
    </div>
  );
};

export default GoogleSignInButton;
