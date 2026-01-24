import { useLoaderData, Form, useActionData, useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Badge } from "~/components/ui/badge/badge";
import { Button } from "~/components/ui/button/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select/select";
import { FileText, Clock, CheckCircle, XCircle, User, Mail, Phone, Calendar, Hash, Upload, File, Trash2, Download, ExternalLink } from "lucide-react";
import type { Route } from "./+types/_admin.orders";
import styles from "./_admin.orders.module.css";

export async function loader() {
  const { getOrders } = await import("~/lib/supabase-storage.server");
  const orders = await getOrders();
  return { orders };
}

export async function action({ request }: Route.ActionArgs) {
  const {
    updateOrderStatus,
    uploadOrderPaper,
    updateOrderDeliverables,
    deleteOrderDeliverable,
    createOrderPaperSignedUrl,
  } = await import("~/lib/supabase-storage.server");
  const formData = await request.formData();
  const actionType = formData.get("_action") as string;

  try {
    if (actionType === "uploadPaper") {
      const orderId = formData.get("orderId") as string;
      const file = formData.get("paperFile") as File;

      if (!file || file.size === 0) {
        return { success: false, error: "Please select a file to upload." };
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/zip",
        "application/x-rar-compressed",
      ];

      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR" };
      }

      // Max file size: 50MB
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return { success: false, error: "File size exceeds 50MB limit." };
      }

      const { storagePath, publicUrl } = await uploadOrderPaper(file, orderId);
      await updateOrderDeliverables(orderId, { name: file.name, storagePath, publicUrl });

      return { success: true, action: "uploadPaper", message: "Paper uploaded successfully!" };
    }

    if (actionType === "deletePaper") {
      const orderId = formData.get("orderId") as string;
      const paperUrl = formData.get("paperUrl") as string | null;
      const storagePath = formData.get("storagePath") as string | null;

      await deleteOrderDeliverable(orderId, { storagePath, url: paperUrl });
      return { success: true, action: "deletePaper", message: "Paper deleted successfully!" };
    }

    if (actionType === "downloadPaper") {
      const storagePath = formData.get("storagePath") as string | null;
      const paperUrl = formData.get("paperUrl") as string | null;

      if (storagePath) {
        const signedUrl = await createOrderPaperSignedUrl(storagePath);
        return { success: true, action: "downloadPaper", signedUrl };
      }

      if (paperUrl) {
        return { success: true, action: "downloadPaper", signedUrl: paperUrl };
      }

      return { success: false, error: "Missing file information." };
    }

    // Default: update status
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as "pending" | "processing" | "completed" | "cancelled";
    await updateOrderStatus(orderId, status);
    return { success: true, action: "updateStatus" };
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed. Please try again." };
  }
}

export default function AdminOrders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const downloadFetcher = useFetcher<typeof action>();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (downloadFetcher.data?.success && downloadFetcher.data.signedUrl) {
      window.open(downloadFetcher.data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }, [downloadFetcher.data]);

  const handleFileSelect = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFiles((prev) => ({ ...prev, [orderId]: file || null }));
  };

  const handleUpload = (orderId: string) => {
    const file = selectedFiles[orderId];
    if (!file) return;

    const formData = new FormData();
    formData.append("_action", "uploadPaper");
    formData.append("orderId", orderId);
    formData.append("paperFile", file);

    fetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    setSelectedFiles((prev) => ({ ...prev, [orderId]: null }));
  };

  const handleDeletePaper = (orderId: string, paperUrl: string | null, storagePath?: string | null) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;

    const formData = new FormData();
    formData.append("_action", "deletePaper");
    formData.append("orderId", orderId);
    if (paperUrl) formData.append("paperUrl", paperUrl);
    if (storagePath) formData.append("storagePath", storagePath);

    fetcher.submit(formData, { method: "post" });
  };

  const handleDownloadPaper = (storagePath?: string | null, paperUrl?: string | null) => {
    const formData = new FormData();
    formData.append("_action", "downloadPaper");
    if (storagePath) formData.append("storagePath", storagePath);
    if (paperUrl) formData.append("paperUrl", paperUrl);

    downloadFetcher.submit(formData, { method: "post" });
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
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>View and manage all customer orders</p>
      </div>

      {actionData && !actionData.success && actionData.error && (
        <div style={{
          padding: "12px",
          marginBottom: "16px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c00"
        }}>
          {actionData.error}
        </div>
      )}

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
                    <h4 className={styles.sectionTitle}>Order Details</h4>
                    <div className={styles.detailRow}>
                      <User size={16} />
                      <span>User ID: {order.user_id?.slice(0, 8)}...</span>
                    </div>
                    <div className={styles.detailRow}>
                      <FileText size={16} />
                      <span>{order.topic}</span>
                    </div>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Domain:</span>
                        <span className={styles.value}>{order.domain}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Type:</span>
                        <span className={styles.value}>{order.type}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Pages:</span>
                        <span className={styles.value}>{order.pages}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Citation:</span>
                        <span className={styles.value}>{order.citation_style}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Total:</span>
                        <span className={styles.value}>₹{order.total_price.toLocaleString()}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Deadline:</span>
                        <span className={styles.value}>{new Date(order.deadline).toLocaleDateString()}</span>
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

                  {/* Paper Upload Section */}
                  <div className={styles.uploadSection}>
                    <h4 className={styles.sectionTitle}>
                      <Upload size={16} />
                      Upload Paper
                    </h4>
                    <div className={styles.uploadControls}>
                      <input
                        type="file"
                        id={`file-${order.id}`}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                        onChange={(e) => handleFileSelect(order.id, e)}
                        className={styles.fileInput}
                      />
                      <label htmlFor={`file-${order.id}`} className={styles.fileLabel}>
                        <File size={16} />
                        {selectedFiles[order.id]?.name || "Choose file..."}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpload(order.id)}
                        disabled={!selectedFiles[order.id] || fetcher.state !== "idle"}
                      >
                        {fetcher.state !== "idle" ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                    <p className={styles.uploadHint}>
                      Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR (max 50MB)
                    </p>
                  </div>

                  {/* Uploaded Deliverables */}
                  {order.deliverables && Array.isArray(order.deliverables) && order.deliverables.length > 0 && (
                    <div className={styles.deliverablesSection}>
                      <h4 className={styles.sectionTitle}>
                        <FileText size={16} />
                        Uploaded Papers ({order.deliverables.length})
                      </h4>
                      <ul className={styles.deliverablesList}>
                        {order.deliverables.map((deliverable: any, idx: number) => (
                          <li key={idx} className={styles.deliverableItem}>
                            <div className={styles.deliverableInfo}>
                              <File size={14} />
                              <span className={styles.deliverableName}>{deliverable.name}</span>
                              <span className={styles.deliverableDate}>
                                {new Date(deliverable.uploaded_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className={styles.deliverableActions}>
                              <button
                                type="button"
                                onClick={() => handleDownloadPaper(deliverable.storage_path, deliverable.url)}
                                className={styles.downloadLink}
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePaper(order.id, deliverable.url, deliverable.storage_path)}
                                className={styles.deleteButton}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
