import { Form, useLoaderData, useActionData, redirect } from "react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { Route } from "./+types/order";
import styles from "./order.module.css";

export async function loader() {
  const { getPricingPlans } = await import("~/lib/supabase-storage.server");
  const plans = await getPricingPlans();
  const plan = plans[0]; // Only one plan now
  return { plan };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const pages = parseInt(formData.get("pages") as string);
  const requirements = formData.get("requirements") as string;

  // Validation
  if (!name || !email || !phone || !pages || !requirements) {
    return { error: "All fields are required" };
  }

  if (!/^\d{10}$/.test(phone)) {
    return { error: "Phone number must be 10 digits" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email address" };
  }

  if (pages < 1) {
    return { error: "Pages must be at least 1" };
  }

  try {
    const { createOrder, getPricingPlans } = await import("~/lib/supabase-storage.server");

    // Get plan details
    const plans = await getPricingPlans();
    const plan = plans[0];

    if (!plan) {
      return { error: "No pricing plan available" };
    }

    // Calculate price: ₹2000 for up to 50 pages, ₹50 per extra page
    const extraPages = pages > 50 ? pages - 50 : 0;
    const extraPagesCost = extraPages * 50;
    const totalPrice = plan.base_price + extraPagesCost;

    // Create order
    const order = await createOrder({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      plan_id: plan.id,
      plan_name: plan.name,
      pages,
      requirements,
      total_price: totalPrice,
      status: "pending",
    });

    // Redirect to dashboard with success message
    return redirect(`/dashboard?order=${order.id}`);
  } catch (error) {
    console.error("Order creation error:", error);
    return { error: "Failed to create order. Please try again." };
  }
}

export default function OrderPage({ loaderData, actionData }: Route.ComponentProps) {
  const { plan } = loaderData;
  const [pages, setPages] = useState(10);

  // Calculate price
  const extraPages = pages > 50 ? pages - 50 : 0;
  const extraPagesCost = extraPages * 50;
  const totalPrice = plan.base_price + extraPagesCost;

  if (!plan) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Place Your Order</h1>
          <p className={styles.subtitle}>No pricing plan available at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Place Your Order</h1>
        <p className={styles.subtitle}>Fill in your details and requirements to get started</p>
      </div>

      <div className={styles.content}>
        <Card className={styles.formCard}>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className={styles.form}>
              {/* Name */}
              <div className={styles.field}>
                <Label htmlFor="name">Full Name *</Label>
                <Input type="text" id="name" name="name" placeholder="Enter your full name" required />
              </div>

              {/* Email */}
              <div className={styles.field}>
                <Label htmlFor="email">Email Address *</Label>
                <Input type="email" id="email" name="email" placeholder="your.email@example.com" required />
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              {/* Number of Pages */}
              <div className={styles.field}>
                <Label htmlFor="pages">Number of Pages *</Label>
                <Input
                  type="number"
                  id="pages"
                  name="pages"
                  min="1"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value) || 0)}
                  required
                />
                <p className={styles.hint}>Up to 50 pages at ₹2,000 • Extra pages at ₹50/page</p>
              </div>

              {/* Requirements */}
              <div className={styles.field}>
                <Label htmlFor="requirements">Requirements & Instructions *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Describe your research topic, specific requirements, citation style, and any other important details..."
                  rows={6}
                  required
                />
              </div>

              {/* Price Summary */}
              <div className={styles.priceSummary}>
                <h3 className={styles.summaryTitle}>Price Summary</h3>
                <div className={styles.summaryRow}>
                  <span>{plan.name} Plan (Up to 50 pages):</span>
                  <span>₹{plan.base_price.toLocaleString()}</span>
                </div>
                {extraPages > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Extra pages ({extraPages} × ₹50):</span>
                    <span>₹{extraPagesCost.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Pages ordered:</span>
                  <span>{pages} pages</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery time:</span>
                  <span>{plan.delivery_days} days</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total Price:</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Error Message */}
              {actionData?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" size="lg" style={{ width: "100%" }}>
                Place Order - ₹{totalPrice.toLocaleString()}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className={styles.infoCard}>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className={styles.infoContent}>
            <div className={styles.infoStep}>
              <CheckCircle className={styles.infoIcon} />
              <div>
                <h4 className={styles.infoStepTitle}>1. Order Confirmation</h4>
                <p className={styles.infoStepText}>
                  You'll receive an order confirmation with payment details in your dashboard
                </p>
              </div>
            </div>

            <div className={styles.infoStep}>
              <CheckCircle className={styles.infoIcon} />
              <div>
                <h4 className={styles.infoStepTitle}>2. Payment</h4>
                <p className={styles.infoStepText}>Complete payment via UPI/QR code and upload payment screenshot</p>
              </div>
            </div>

            <div className={styles.infoStep}>
              <CheckCircle className={styles.infoIcon} />
              <div>
                <h4 className={styles.infoStepTitle}>3. We Work On It</h4>
                <p className={styles.infoStepText}>Our experts start working on your research paper immediately</p>
              </div>
            </div>

            <div className={styles.infoStep}>
              <CheckCircle className={styles.infoIcon} />
              <div>
                <h4 className={styles.infoStepTitle}>4. Delivery</h4>
                <p className={styles.infoStepText}>
                  Download your completed paper from the dashboard when it's ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
