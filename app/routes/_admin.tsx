import { Outlet, useNavigate, NavLink } from "react-router";
import { useEffect } from "react";
import { FileText, LogOut, Package, DollarSign, Users, ShoppingCart, Settings } from "lucide-react";
import { getCurrentAdmin, logoutAdmin } from "~/lib/auth";
import { APP_CONFIG } from "~/config";
import { Button } from "~/components/ui/button/button";
import styles from "./_admin.module.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  useEffect(() => {
    if (!admin) {
      navigate("/admin/login");
    }
  }, [admin, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  if (!admin) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <FileText />
            <span>{APP_CONFIG.name} Admin</span>
          </div>
          <div className={styles.adminInfo}>
            <span className={styles.adminEmail}>{admin.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className={styles.logoutIcon} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <NavLink to="/admin" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>
              <Package />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <ShoppingCart />
              All Orders
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <Users />
              Customers
            </NavLink>
            <NavLink
              to="/admin/pricing"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <DollarSign />
              Pricing Plans
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <Settings />
              Settings
            </NavLink>
          </nav>
        </aside>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
