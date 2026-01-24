import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { FileText, Mail } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { getCurrentUser } from "~/lib/auth";
import { storage } from "~/lib/storage";
import { APP_CONFIG } from "~/config";
import { supabase, isConfigured } from "~/lib/supabase.client";
import styles from "./login.module.css";

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 20000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithTimeout("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      }, 20000); // 20 second timeout

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        if (data.devMode && data.otp) {
          setDevOtp(data.otp);
          console.log(`📧 Development OTP: ${data.otp}`);
        }
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithTimeout("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, otp }),
      }, 20000); // 20 second timeout

      const data = await response.json();

      if (response.ok && data.success) {
        // Save user to localStorage on client-side (server can't access localStorage)
        if (data.user) {
          const user = {
            id: data.user.id,
            email: data.user.email,
            createdAt: new Date().toISOString(),
          };
          // Save user to users list (for future lookups)
          storage.saveUser(user);
          // Set as current logged-in user
          storage.setCurrentUser(user);
        }
        // Check if there's a redirect URL stored (e.g., from order page)
        const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");
        // Redirect to the stored URL or dashboard
        window.location.href = redirectUrl || "/dashboard";
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp("");
    setError("");
    setDevOtp("");
  };

  const handleGoogleLogin = async () => {
    console.log("🔵 Google login initiated");
    setLoading(true);
    try {
      console.log("Checking Supabase config:", {
        url: import.meta.env.VITE_SUPABASE_URL ? "Set" : "Missing",
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Missing"
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("❌ Google login error:", error.message);
        setError(error.message);
        setLoading(false);
      } else {
        console.log("✅ Google login redirecting...");
        // Keep loading true as we redirect
      }
    } catch (err) {
      console.error("❌ Unexpected error during Google login:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardContent>
          <div className={styles.header}>
            <div className={styles.logo}>
              <FileText className={styles.logoIcon} />
              {APP_CONFIG.name}
            </div>
            <h1 className={styles.title}>
              {step === "email" ? "Welcome Back" : "Verify OTP"}
            </h1>
            <p className={styles.subtitle}>
              {step === "email"
                ? "Enter your email to receive a login code"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {step === "email" ? (
            <form className={styles.form} onSubmit={handleSendOTP}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <div className={styles.inputWithIcon}>
                  <Mail className={styles.inputIcon} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || !isConfigured}
                  />
                </div>
                {error && <span className={styles.error}>{error}</span>}
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Login Code"}
              </Button>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              {!isConfigured && (
                <div className={styles.supabaseWarning}>
                  ⚠️ Supabase not configured in this environment
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading || !isConfigured}
                className={styles.googleButton}
              >
                <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleVerifyOTP}>
              {devOtp && (
                <div className={styles.otpInfo}>
                  <p className={styles.devOtpNote}>
                    <strong>Development Mode:</strong> Your OTP is <strong>{devOtp}</strong>
                  </p>
                  <p className={styles.devOtpHint}>
                    (Email service unavailable - using console OTP)
                  </p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="otp">Enter 6-Digit Code</label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  disabled={loading}
                  className={styles.otpInput}
                />
                {error && <span className={styles.error}>{error}</span>}
              </div>

              <div className={styles.emailInfo}>
                <p>Code sent to: <strong>{email}</strong></p>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className={styles.backButton}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}

          <div className={styles.adminLink}>
            <Link to="/admin/login">Admin Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
