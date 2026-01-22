import { useLoaderData } from "react-router";
import { Link } from "react-router";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import type { Route } from "./+types/_public.pricing";
import styles from "./_public.pricing.module.css";

export async function loader() {
  const { getPricingPlans } = await import("~/lib/supabase-storage.server");
  const plans = await getPricingPlans();
  return { plans };
}

export default function PricingPage({ loaderData }: Route.ComponentProps) {
  const { plans } = loaderData;
  const plan = plans[0]; // Only one plan now

  if (!plan) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pricing Plan</h1>
          <p className={styles.subtitle}>No pricing plan available at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thesis Writing Service</h1>
        <p className={styles.subtitle}>Professional thesis writing at a fixed price</p>
      </div>

      <div className={styles.singlePlanWrapper}>
        <Card className={styles.singlePlanCard}>
          <div className={styles.popularBadge}>Best Value</div>

          <CardHeader className={styles.planHeader}>
            <h2 className={styles.planName}>{plan.name} Plan</h2>
            <div className={styles.planPrice}>
              ₹{plan.base_price.toLocaleString()}
            </div>
            <p className={styles.planDelivery}>Up to 50 pages • ₹50/extra page • {plan.delivery_days} days delivery</p>
          </CardHeader>

          <CardContent className={styles.planContent}>
            <ul className={styles.featuresList}>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Up to 50 pages included</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Extra pages at ₹50/page</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Professional thesis writing</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Proper citations & references</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Plagiarism-free content</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Professional formatting</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Unlimited revisions</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>{plan.delivery_days} days delivery time</span>
              </li>
              <li className={styles.feature}>
                <Check className={styles.featureIcon} />
                <span>Quality assurance</span>
              </li>
            </ul>
          </CardContent>

          <CardFooter>
            <Button asChild style={{ width: "100%" }}>
              <Link to={`/order?plan=${plan.id}`}>Place Your Order</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className={styles.note}>
        <p>
          Base price of ₹2,000 for thesis writing up to 50 pages. Extra pages charged at ₹50 per page.
          Includes professional research, proper citations, plagiarism-free content, and unlimited revisions.
        </p>
        <p className={styles.examples}>
          <strong>Pricing Examples:</strong> 30 pages = ₹2,000 • 50 pages = ₹2,000 • 60 pages = ₹2,500 • 100 pages = ₹4,500
        </p>
      </div>
    </div>
  );
}
