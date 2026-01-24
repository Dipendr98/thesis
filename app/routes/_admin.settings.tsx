import { useState, useEffect, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Separator } from "~/components/ui/separator/separator";
import { Settings, Save, Lock, QrCode, Upload, Trash2 } from "lucide-react";
import { storage } from "~/lib/storage";
import { toast } from "sonner";
import type { Route } from "./+types/_admin.settings";
import styles from "./_admin.settings.module.css";

export async function loader() {
  const { getQRSettings } = await import("~/lib/supabase-storage.server");
  const qrSettings = await getQRSettings();
  return { qrSettings };
}

export async function action({ request }: Route.ActionArgs) {
  const { uploadQRCodeImage, updateQRSettings } = await import(
    "~/lib/supabase-storage.server"
  );

  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "uploadQR") {
    const file = formData.get("qrImage") as File;

    if (!file || file.size === 0) {
      return { success: false, error: "Please select a file to upload" };
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a valid image file (PNG, JPG, or WebP)",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File size must be less than 5MB" };
    }

    try {
      const imageUrl = await uploadQRCodeImage(file);
      await updateQRSettings(imageUrl);
      return { success: true, qrImageUrl: imageUrl };
    } catch (error) {
      console.error("Failed to upload QR code:", error);
      return {
        success: false,
        error: "Failed to upload QR code. Please try again.",
      };
    }
  }

  if (actionType === "removeQR") {
    try {
      await updateQRSettings("");
      return { success: true, removed: true };
    } catch (error) {
      console.error("Failed to remove QR code:", error);
      return {
        success: false,
        error: "Failed to remove QR code. Please try again.",
      };
    }
  }

  return { success: false, error: "Invalid action" };
}

export default function AdminSettingsPage({
  loaderData,
}: Route.ComponentProps) {
  const { qrSettings } = loaderData;
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [supportEmail, setSupportEmail] = useState("");
  const [supportWhatsApp, setSupportWhatsApp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(
    qrSettings?.qr_image_url || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const settings = storage.getAppSettings();
    if (settings) {
      setSupportEmail(settings.supportEmail);
      setSupportWhatsApp(settings.supportWhatsApp);
    }
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        if (fetcher.data.qrImageUrl) {
          setQrPreview(fetcher.data.qrImageUrl);
          toast.success("QR code uploaded successfully!");
        } else if (fetcher.data.removed) {
          setQrPreview(null);
          toast.success("QR code removed successfully!");
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else if (fetcher.data.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.data]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQR = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("_action", "uploadQR");
    formData.append("qrImage", selectedFile);
    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  const handleRemoveQR = () => {
    const formData = new FormData();
    formData.append("_action", "removeQR");
    fetcher.submit(formData, { method: "post" });
  };

  const isUploading = fetcher.state === "submitting";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Settings className={styles.titleIcon} />
          Admin Settings
        </h1>
        <p className={styles.subtitle}>
          Manage your contact details, payment QR code, and account settings
        </p>
      </div>

      <div className={styles.content}>
        {/* Payment QR Code Section */}
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.cardTitleWithIcon}>
              <QrCode className={styles.cardIcon} />
              Payment QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.qrSection}>
              <p className={styles.fieldDescription}>
                Upload your UPI/payment QR code. This will be shown to customers
                during checkout for payment.
              </p>

              <div className={styles.qrUploadArea}>
                {qrPreview ? (
                  <div className={styles.qrPreviewContainer}>
                    <img
                      src={qrPreview}
                      alt="Payment QR Code"
                      className={styles.qrPreview}
                    />
                    <div className={styles.qrActions}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className={styles.buttonIcon} />
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveQR}
                        disabled={isUploading}
                      >
                        <Trash2 className={styles.buttonIcon} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.qrDropzone}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <QrCode className={styles.qrDropzoneIcon} />
                    <p className={styles.qrDropzoneText}>
                      Click to upload QR code
                    </p>
                    <p className={styles.qrDropzoneHint}>
                      PNG, JPG or WebP (max 5MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className={styles.hiddenInput}
                />
              </div>

              {selectedFile && (
                <div className={styles.selectedFileInfo}>
                  <span>Selected: {selectedFile.name}</span>
                  <Button
                    type="button"
                    onClick={handleUploadQR}
                    disabled={isUploading}
                    className={styles.saveButton}
                  >
                    <Save className={styles.buttonIcon} />
                    {isUploading ? "Uploading..." : "Save QR Code"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Details Section */}
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

        {/* Change Password Section */}
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
