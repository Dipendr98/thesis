import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser, logoutUser } from "~/lib/auth";
import { Button } from "~/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { FileText, LogOut, User } from "lucide-react";
import { APP_CONFIG } from "~/config";
import type { Route } from "./+types/dashboard";
import styles from "./dashboard.module.css";

export async function loader({ request }: Route.LoaderArgs) {
  const user = getCurrentUser();

  if (!user) {
    return { user: null, orders: [] };
  }

  try {
    const { getOrdersByUserId } = await import("~/lib/supabase-storage.server");
    const orders = await getOrdersByUserId(user.id);
    return { user, orders };
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return { user, orders: [] };
  }
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user: loadedUser, orders } = loaderData;
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <FileText className={styles.logoIcon} />
          {APP_CONFIG.name}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut />
          Logout
        </Button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome to Your Dashboard</h1>
          <p>Manage your thesis printing and binding orders</p>
        </div>

        <div className={styles.grid}>
          <Card>
            <CardHeader>
              <CardTitle>
                <User />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.profileInfo}>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.mobile && (
                  <p>
                    <strong>Mobile:</strong> {user.mobile}
                  </p>
                )}
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <FileText />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <>
                  <p className={styles.emptyState}>No orders yet</p>
                  <Button className={styles.orderButton} onClick={() => navigate("/order")}>
                    Place Your First Order
                  </Button>
                </>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order: any) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                          <div>
                            <h4 className={styles.orderTitle}>{order.topic}</h4>
                            <p className={styles.orderDate}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "processing"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className={styles.orderDetails}>
                        <div className={styles.orderDetail}>
                          <span className={styles.orderLabel}>Pages:</span>
                          <span className={styles.orderValue}>{order.pages}</span>
                        </div>
                        <div className={styles.orderDetail}>
                          <span className={styles.orderLabel}>Total:</span>
                          <span className={styles.orderValue}>₹{order.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.actions}>
                <Button onClick={() => navigate("/pricing")}>View Pricing</Button>
                <Button variant="outline" onClick={() => navigate("/contact")}>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
