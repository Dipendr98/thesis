import { useLoaderData, useFetcher } from "react-router";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Pencil, Save, X } from "lucide-react";
import type { Route } from "./+types/_admin.pricing";
import styles from "./_admin.pricing.module.css";

export async function loader() {
  const { getPricingPlans } = await import("~/lib/supabase-storage.server");
  const plans = await getPricingPlans();
  const plan = plans[0]; // Only one plan now
  return { plan };
}

export async function action({ request }: Route.ActionArgs) {
  const { updatePricingPlan } = await import("~/lib/supabase-storage.server");
  const formData = await request.formData();
  const planId = formData.get("planId") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const deliveryDays = parseInt(formData.get("deliveryDays") as string);

  await updatePricingPlan(planId, {
    base_price: basePrice,
    delivery_days: deliveryDays,
  });

  return { success: true };
}

export default function AdminPricing({ loaderData }: Route.ComponentProps) {
  const { plan } = loaderData;
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ basePrice: "", deliveryDays: "" });

  if (!plan) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pricing Plan</h1>
          <p className={styles.subtitle}>No pricing plan available</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      basePrice: plan.base_price.toString(),
      deliveryDays: plan.delivery_days.toString(),
    });
  };

  const handleSave = () => {
    const basePrice = parseFloat(editForm.basePrice);
    const deliveryDays = parseInt(editForm.deliveryDays);

    if (isNaN(basePrice) || isNaN(deliveryDays) || basePrice < 0 || deliveryDays < 1) {
      alert("Please enter valid values (price must be positive, delivery days must be at least 1)");
      return;
    }

    const formData = new FormData();
    formData.append("planId", plan.id);
    formData.append("basePrice", basePrice.toString());
    formData.append("deliveryDays", deliveryDays.toString());

    fetcher.submit(formData, { method: "post" });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ basePrice: "", deliveryDays: "" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pricing Plan</h1>
        <p className={styles.subtitle}>Manage the Standard plan pricing and delivery time</p>
      </div>

      <div className={styles.singlePlanWrapper}>
        <Card className={styles.planCard}>
          <CardHeader>
            <div className={styles.planHeader}>
              <CardTitle>{plan.name} Plan</CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Pencil className={styles.icon} />
                  Edit
                </Button>
              )}
            </div>
            <p className={styles.planDelivery}>Up to 50 pages • ₹50/extra page • {plan.delivery_days} days delivery</p>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Fixed Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    placeholder="Fixed price for up to 50 pages"
                  />
                  <p className={styles.formHint}>This is the total price for up to 50 pages</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Delivery Days</label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.deliveryDays}
                    onChange={(e) => setEditForm({ ...editForm, deliveryDays: e.target.value })}
                    placeholder="Number of days for delivery"
                  />
                  <p className={styles.formHint}>Standard delivery time in days</p>
                </div>
                <div className={styles.actions}>
                  <Button size="sm" onClick={handleSave}>
                    <Save className={styles.icon} />
                    Save Changes
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className={styles.icon} />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.pricing}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Base Price:</span>
                  <span className={styles.priceValue}>₹{plan.base_price.toLocaleString()}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Included Pages:</span>
                  <span className={styles.priceValue}>Up to 50 pages</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Extra Pages:</span>
                  <span className={styles.priceValue}>₹50 per page</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Delivery Time:</span>
                  <span className={styles.priceValue}>{plan.delivery_days} days</span>
                </div>
                <div className={styles.formula}>
                  <p className={styles.formulaTitle}>Pricing Examples:</p>
                  <p className={styles.formulaCalc}>• 30 pages = ₹{plan.base_price.toLocaleString()}</p>
                  <p className={styles.formulaCalc}>• 50 pages = ₹{plan.base_price.toLocaleString()}</p>
                  <p className={styles.formulaCalc}>• 60 pages = ₹{plan.base_price.toLocaleString()} + ₹500 = ₹{(plan.base_price + 500).toLocaleString()}</p>
                  <p className={styles.formulaCalc}>• 100 pages = ₹{plan.base_price.toLocaleString()} + ₹2,500 = ₹{(plan.base_price + 2500).toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={styles.infoCard}>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.infoContent}>
            <p>
              <strong>Fixed Pricing Model</strong>
            </p>
            <ul className={styles.infoList}>
              <li>Base price of ₹{plan.base_price.toLocaleString()} for up to 50 pages</li>
              <li>Extra pages charged at ₹50 per page beyond 50</li>
              <li>Includes professional formatting, plagiarism check, and unlimited revisions</li>
              <li>Standard delivery time: {plan.delivery_days} days</li>
              <li>Automatic price calculation based on number of pages ordered</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
