import { useLoaderData } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { User, Mail, Phone, Calendar, Users } from "lucide-react";
import type { Route } from "./+types/_admin.users";
import styles from "./_admin.users.module.css";

export async function loader() {
  const { getOrders, getUsers } = await import("~/lib/supabase-storage.server");
  const orders = await getOrders();
  const users = await getUsers();

  // Create a map of user_id to user for quick lookup
  const usersMap = new Map(users.map(user => [user.id, user]));

  // Extract customer data from orders grouped by user_id
  const customersMap = new Map<string, {
    id: string;
    email: string;
    name: string;
    mobile?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    statuses: { pending: number; processing: number; completed: number; cancelled: number };
  }>();

  orders.forEach((order) => {
    const user = usersMap.get(order.user_id);
    if (!user) return; // Skip orders without valid users

    const existing = customersMap.get(order.user_id);

    if (existing) {
      existing.totalOrders++;
      existing.totalSpent += order.total_price;

      // Normalize status to lowercase for counting
      const status = order.status.toLowerCase();
      if (status in existing.statuses) {
        existing.statuses[status as keyof typeof existing.statuses]++;
      }

      // Update last order date if more recent
      if (new Date(order.created_at!) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.created_at!;
      }
    } else {
      const status = order.status.toLowerCase();
      customersMap.set(order.user_id, {
        id: user.id,
        email: user.email,
        name: user.name || "Unknown",
        mobile: user.mobile,
        totalOrders: 1,
        totalSpent: order.total_price,
        lastOrderDate: order.created_at!,
        statuses: {
          pending: status === "pending" ? 1 : 0,
          processing: status === "processing" ? 1 : 0,
          completed: status === "completed" ? 1 : 0,
          cancelled: status === "cancelled" ? 1 : 0,
        },
      });
    }
  });

  const customers = Array.from(customersMap.values()).sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
  );

  return { customers };
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { customers } = loaderData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>View all customers and their order history</p>
        </div>
        <div className={styles.stats}>
          <Users size={24} />
          <span className={styles.statsCount}>{customers.length}</span>
          <span className={styles.statsLabel}>Total Customers</span>
        </div>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3>No Customers Yet</h3>
            <p>Customer data will appear here once orders are placed</p>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.customersGrid}>
          {customers.map((customer) => (
            <Card key={customer.email} className={styles.customerCard}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  <User size={20} />
                  {customer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.cardContent}>
                <div className={styles.section}>
                  <div className={styles.detailRow}>
                    <Mail size={16} />
                    <span>{customer.email}</span>
                  </div>
                  {customer.mobile && (
                    <div className={styles.detailRow}>
                      <Phone size={16} />
                      <span>{customer.mobile}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <Calendar size={16} />
                    <span>
                      Last order:{" "}
                      {new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className={styles.statsSection}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Orders</span>
                    <span className={styles.statValue}>{customer.totalOrders}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Spent</span>
                    <span className={styles.statValue}>₹{customer.totalSpent.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.statusBadges}>
                  {customer.statuses.pending > 0 && (
                    <Badge variant="outline" style={{ borderColor: 'var(--color-accent-7)', color: 'var(--color-accent-11)' }}>
                      {customer.statuses.pending} Pending
                    </Badge>
                  )}
                  {customer.statuses.processing > 0 && (
                    <Badge variant="outline" style={{ borderColor: 'var(--color-accent-7)', color: 'var(--color-accent-11)' }}>
                      {customer.statuses.processing} Processing
                    </Badge>
                  )}
                  {customer.statuses.completed > 0 && (
                    <Badge variant="secondary">
                      {customer.statuses.completed} Completed
                    </Badge>
                  )}
                  {customer.statuses.cancelled > 0 && (
                    <Badge variant="destructive">
                      {customer.statuses.cancelled} Cancelled
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
