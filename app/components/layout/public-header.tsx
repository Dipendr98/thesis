import { Link, useLocation } from "react-router";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import classNames from "classnames";
import { Button } from "~/components/ui/button/button";
import { APP_CONFIG } from "~/config";
import styles from "./public-header.module.css";

export function PublicHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        <Button
          variant="outline"
          size="icon"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link
            to="/"
            className={classNames(styles.navLink, isActive("/") && styles.active)}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/pricing"
            className={classNames(styles.navLink, isActive("/pricing") && styles.active)}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className={classNames(styles.navLink, isActive("/about") && styles.active)}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={classNames(styles.navLink, isActive("/contact") && styles.active)}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Button asChild onClick={() => setMobileMenuOpen(false)}>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
