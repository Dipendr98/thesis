import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { storage } from "~/lib/storage";
import type { User } from "~/lib/storage";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          return;
        }

        if (data.session) {
          const supabaseUser = data.session.user;

          // Create or update user in localStorage to match existing auth pattern
          const user: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "",
            createdAt: supabaseUser.created_at || new Date().toISOString(),
          };

          // Save user using the storage system
          storage.saveUser(user);
          storage.setCurrentUser(user);

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          setError("No session found");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center"
      }}>
        <h1>Authentication Error</h1>
        <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>
        <a href="/login" style={{ color: "blue", textDecoration: "underline" }}>
          Return to Login
        </a>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh"
    }}>
      <p>Signing you in...</p>
    </div>
  );
}
