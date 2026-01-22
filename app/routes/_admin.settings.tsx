import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Separator } from "~/components/ui/separator/separator";
import { Settings, Save, Lock } from "lucide-react";
import { storage } from "~/lib/storage";
import { toast } from "sonner";
import styles from "./_admin.settings.module.css";

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [supportEmail, setSupportEmail] = useState("");
  const [supportWhatsApp, setSupportWhatsApp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const settings = storage.getAppSettings();
    if (settings) {
      setSupportEmail(settings.supportEmail);
      setSupportWhatsApp(settings.supportWhatsApp);
    }
  }, []);

  const handleSaveContactDetails = (e: React.FormEvent) => {
    e.preventDefault();

    storage.saveAppSettings({
      id: "app-settings-1",
      supportEmail,
      supportWhatsApp,
      updatedAt: new Date().toISOString(),
    });

    toast.success("Contact details updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    const admin = storage.getAdmin();
    if (!admin) {
      toast.error("Admin not found");
      return;
    }

    if (admin.passwordHash !== currentPassword) {
      toast.error("Current password is incorrect");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    storage.updateAdminPassword(newPassword);
    toast.success("Password changed successfully!");

    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Settings className={styles.titleIcon} />
          Admin Settings
        </h1>
        <p className={styles.subtitle}>Manage your contact details and account settings</p>
      </div>

      <div className={styles.content}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveContactDetails} className={styles.form}>
              <div className={styles.formGroup}>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  placeholder="admin@thesistrack.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                />
                <p className={styles.fieldDescription}>
                  This email will be displayed to users for support inquiries
                </p>
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="supportWhatsApp">Support WhatsApp Number</Label>
                <Input
                  id="supportWhatsApp"
                  type="text"
                  placeholder="+1234567890"
                  value={supportWhatsApp}
                  onChange={(e) => setSupportWhatsApp(e.target.value)}
                  required
                />
                <p className={styles.fieldDescription}>
                  Include country code (e.g., +91 for India, +1 for USA)
                </p>
              </div>

              <Button type="submit" className={styles.saveButton}>
                <Save className={styles.buttonIcon} />
                Save Contact Details
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>
              <Lock className={styles.titleIcon} />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className={styles.form}>
              <div className={styles.formGroup}>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <Separator className={styles.separator} />

              <div className={styles.formGroup}>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className={styles.saveButton}>
                <Lock className={styles.buttonIcon} />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
