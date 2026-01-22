import { useLoaderData, Form } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Button } from "~/components/ui/button/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select/select";
import { FileText, Clock, CheckCircle, XCircle, User, Mail, Phone, Calendar, Hash } from "lucide-react";
import type { Route } from "./+types/_admin.orders";
import styles from "./_admin.orders.module.css";

export async function loader() {
  const { getOrders } = await import("~/lib/supabase-storage.server");
  const orders = await getOrders();
  return { orders };
}

export async function action({ request }: Route.ActionArgs) {
  const { updateOrderStatus } = await import("~/lib/supabase-storage.server");
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as "pending" | "processing" | "completed" | "cancelled";

  await updateOrderStatus(orderId, status);
  return { success: true };
}

export default function AdminOrders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;

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
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>View and manage all customer orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyState}>
            <FileText className={styles.emptyIcon} />
            <h3>No Orders Yet</h3>
            <p>Customer orders will appear here once they start placing them</p>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <Card key={order.id} className={styles.orderCard}>
                <CardHeader className={styles.cardHeader}>
                  <div className={styles.orderNumber}>
                    <Hash size={16} />
                    Order {order.id.slice(0, 8)}
                  </div>
                  <Badge variant={getStatusColor(order.status) as any}>
                    <StatusIcon size={14} />
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Customer Details</h4>
                    <div className={styles.detailRow}>
                      <User size={16} />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <Mail size={16} />
                      <span>{order.customer_email}</span>
                    </div>
                    {order.customer_phone && (
                      <div className={styles.detailRow}>
                        <Phone size={16} />
                        <span>{order.customer_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Order Details</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Pages:</span>
                        <span className={styles.value}>{order.pages}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Total:</span>
                        <span className={styles.value}>₹{order.total_price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.detailRow}>
                      <Calendar size={16} />
                      <span className={styles.dateText}>
                        {new Date(order.created_at!).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <Form method="post" className={styles.statusForm}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <div className={styles.statusUpdate}>
                      <label htmlFor={`status-${order.id}`} className={styles.statusLabel}>
                        Update Status:
                      </label>
                      <div className={styles.statusControls}>
                        <Select name="status" defaultValue={order.status}>
                          <SelectTrigger id={`status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
