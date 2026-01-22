import { useLoaderData } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Route } from "./+types/_admin._index";
import styles from "./_admin._index.module.css";

export async function loader() {
  const { getOrders } = await import("~/lib/supabase-storage.server");
  const orders = await getOrders();
  return { orders };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "processing":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return FileText;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return FileText;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of your thesis tracking system</p>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card className={styles.ordersCard}>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText className={styles.emptyIcon} />
              <p>No orders yet</p>
              <p className={styles.emptySubtext}>Orders will appear here once customers start placing them</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <h3 className={styles.orderCustomer}>{order.topic}</h3>
                        <p className={styles.orderEmail}>{order.domain} - {order.type}</p>
                      </div>
                      <Badge variant={getStatusColor(order.status) as any}>
                        <StatusIcon className={styles.badgeIcon} />
                        {order.status}
                      </Badge>
                    </div>
                    <div className={styles.orderDetails}>
                      <div className={styles.orderMeta}>
                        <span>Pages: {order.pages}</span>
                        <span>Total: ₹{order.total_price.toLocaleString()}</span>
                      </div>
                      <div className={styles.orderDate}>
                        {new Date(order.created_at!).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
