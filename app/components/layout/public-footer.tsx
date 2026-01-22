import { Link } from "react-router";
import { APP_CONFIG, getAppSettings } from "~/config";
import styles from "./public-footer.module.css";

export function PublicFooter() {
  const settings = getAppSettings();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.section}>
            <h3>{APP_CONFIG.name}</h3>
            <p>Professional research paper and report writing service. Quality academic work delivered on time.</p>
          </div>

          <div className={styles.section}>
            <h3>Quick Links</h3>
            <div className={styles.links}>
              <Link to="/" className={styles.link}>
                Home
              </Link>
              <Link to="/pricing" className={styles.link}>
                Pricing
              </Link>
              <Link to="/about" className={styles.link}>
                About Us
              </Link>
              <Link to="/contact" className={styles.link}>
                Contact
              </Link>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Support</h3>
            <div className={styles.links}>
              <a
                href={`https://wa.me/${settings.supportWhatsApp}`}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Support
              </a>
              <Link to="/contact" className={styles.link}>
                Contact Form
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
