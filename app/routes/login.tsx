import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { FileText, Mail } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { getCurrentUser } from "~/lib/auth";
import { APP_CONFIG } from "~/config";
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
        // Reload to update session
        window.location.href = "/dashboard";
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
                    disabled={loading}
                  />
                </div>
                {error && <span className={styles.error}>{error}</span>}
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Login Code"}
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
