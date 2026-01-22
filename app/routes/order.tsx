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

export async function loader({ request }: Route.LoaderArgs) {
  const { getCurrentUser } = await import("~/lib/auth");
  const user = getCurrentUser();

  if (!user) {
    throw redirect("/login");
  }

  const { getPricingPlans } = await import("~/lib/supabase-storage.server");
  const plans = await getPricingPlans();
  const plan = plans[0]; // Only one plan now
  return { plan, user };
}

export async function action({ request }: Route.ActionArgs) {
  const { getCurrentUser } = await import("~/lib/auth");
  const user = getCurrentUser();

  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const pages = parseInt(formData.get("pages") as string);
  const requirements = formData.get("requirements") as string;
  const topic = formData.get("topic") as string;
  const domain = formData.get("domain") as string;
  const type = formData.get("type") as string;
  const citationStyle = formData.get("citation_style") as string;

  // Validation
  if (!pages || !requirements || !topic || !domain || !type || !citationStyle) {
    return { error: "All fields are required" };
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

    // Calculate deadline based on delivery days
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + plan.delivery_days);

    // Create order with user_id
    const order = await createOrder({
      user_id: user.id,
      topic,
      domain,
      type,
      pages,
      citation_style: citationStyle,
      deadline: deadline.toISOString(),
      notes: requirements,
      plan_id: plan.id,
      status: "Pending Payment",
      total_price: totalPrice,
    });

    // Redirect to dashboard with success message
    return redirect(`/dashboard?order=${order.id}`);
  } catch (error) {
    console.error("Order creation error:", error);
    return { error: "Failed to create order. Please try again." };
  }
}

export default function OrderPage({ loaderData, actionData }: Route.ComponentProps) {
  const { plan, user } = loaderData;
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
              {/* Topic */}
              <div className={styles.field}>
                <Label htmlFor="topic">Research Topic *</Label>
                <Input type="text" id="topic" name="topic" placeholder="e.g., Machine Learning in Healthcare" required />
              </div>

              {/* Domain */}
              <div className={styles.field}>
                <Label htmlFor="domain">Academic Domain *</Label>
                <Input type="text" id="domain" name="domain" placeholder="e.g., Computer Science, Medicine, Business" required />
              </div>

              {/* Type */}
              <div className={styles.field}>
                <Label htmlFor="type">Paper Type *</Label>
                <Input type="text" id="type" name="type" placeholder="e.g., Research Paper, Thesis, Dissertation" required />
              </div>

              {/* Citation Style */}
              <div className={styles.field}>
                <Label htmlFor="citation_style">Citation Style *</Label>
                <Input type="text" id="citation_style" name="citation_style" placeholder="e.g., APA, MLA, Chicago, IEEE" required />
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
