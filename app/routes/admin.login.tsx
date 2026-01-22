import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { FileText } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { loginAdmin, getCurrentAdmin } from "~/lib/auth";
import { storage } from "~/lib/storage";
import { APP_CONFIG } from "~/config";
import styles from "./admin.login.module.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize seed data including admin credentials
    storage.initializeSeedData();
    
    const admin = getCurrentAdmin();
    if (admin) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const admin = loginAdmin(email, password);
    if (admin) {
      navigate("/admin");
    } else {
      setError("Invalid credentials");
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
            <h1 className={styles.title}>Admin Login</h1>
            <p className={styles.subtitle}>Access the admin panel</p>
          </div>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="admin@thesistrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <span className={styles.error}>{error}</span>}
            </div>

            <Button type="submit">Login</Button>
          </form>

          <div className={styles.backLink}>
            <Link to="/login">← Back to User Login</Link>
          </div>

          <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>Demo Credentials:</p>
            <p>Email: admin@thesistrack.com</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
