export const APP_CONFIG = {
  name: "ThesisTrack",
  tagline: "Get research paper & report delivered before your deadline",
  supportWhatsApp: "+1234567890",
  adminEmail: "admin@thesistrack.com",
  adminPassword: "admin123",
};

// Helper function to get current settings from storage with fallback to defaults
export function getAppSettings() {
  if (typeof window === "undefined") {
    return {
      supportEmail: APP_CONFIG.adminEmail,
      supportWhatsApp: APP_CONFIG.supportWhatsApp,
    };
  }

  try {
    const settingsStr = localStorage.getItem("appSettings");
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      return {
        supportEmail: settings.supportEmail || APP_CONFIG.adminEmail,
        supportWhatsApp: settings.supportWhatsApp || APP_CONFIG.supportWhatsApp,
      };
    }
  } catch (error) {
    console.error("Error reading app settings:", error);
  }

  return {
    supportEmail: APP_CONFIG.adminEmail,
    supportWhatsApp: APP_CONFIG.supportWhatsApp,
  };
}

export const ORDER_STATUS = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_SUBMITTED: "Payment Submitted",
  VERIFIED: "Verified",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
} as const;

export const DOMAINS = [
  "Engineering",
  "Management",
  "Medical",
  "Computer Science",
  "Social Sciences",
  "Natural Sciences",
  "Arts & Humanities",
  "Law",
  "Education",
  "Other",
];

export const PAPER_TYPES = ["Research Paper", "Report", "Both"];

export const CITATION_STYLES = ["APA", "MLA", "IEEE", "Chicago", "Harvard"];
