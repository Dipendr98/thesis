import { Link, useLocation } from "react-router";
import { FileText } from "lucide-react";
import classNames from "classnames";
import { Button } from "~/components/ui/button/button";
import { APP_CONFIG } from "~/config";
import styles from "./public-header.module.css";

export function PublicHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <FileText className={styles.logoIcon} />
          {APP_CONFIG.name}
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={classNames(styles.navLink, isActive("/") && styles.active)}>
            Home
          </Link>
          <Link to="/pricing" className={classNames(styles.navLink, isActive("/pricing") && styles.active)}>
            Pricing
          </Link>
          <Link to="/about" className={classNames(styles.navLink, isActive("/about") && styles.active)}>
            About
          </Link>
          <Link to="/contact" className={classNames(styles.navLink, isActive("/contact") && styles.active)}>
            Contact
          </Link>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
