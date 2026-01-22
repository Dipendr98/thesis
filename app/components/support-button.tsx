import { MessageCircle } from "lucide-react";
import { APP_CONFIG } from "~/config";
import styles from "./support-button.module.css";

export function SupportButton() {
  const handleClick = () => {
    window.open(`https://wa.me/${APP_CONFIG.supportWhatsApp}`, "_blank");
  };

  return (
    <button className={styles.button} onClick={handleClick} aria-label="WhatsApp Support">
      <MessageCircle className={styles.icon} />
    </button>
  );
}
