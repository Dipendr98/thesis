import { MessageCircle } from "lucide-react";
import { getAppSettings } from "~/config";
import styles from "./support-button.module.css";

export function SupportButton() {
  const handleClick = () => {
    const settings = getAppSettings();
    window.open(`https://wa.me/${settings.supportWhatsApp}`, "_blank");
  };

  return (
    <button className={styles.button} onClick={handleClick} aria-label="WhatsApp Support">
      <MessageCircle className={styles.icon} />
    </button>
  );
}
