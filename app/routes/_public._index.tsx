import { Link } from "react-router";
import { FileText, Upload, CheckCircle, Download } from "lucide-react";
import { Button } from "~/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion/accordion";
import { APP_CONFIG } from "~/config";
import styles from "./_public._index.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{APP_CONFIG.tagline}</h1>
          <p className={styles.heroSubtitle}>
            Professional research papers and reports crafted by experts. Quality work, on-time delivery, and complete
            plagiarism-free guarantee.
          </p>
          <div className={styles.heroActions}>
            <Button size="lg" asChild>
              <Link to="/order">Place Order</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Submit Your Requirements</h3>
            <p className={styles.stepDescription}>
              Fill out our simple form with your research topic, domain, and specific requirements.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Choose Plan & Pay</h3>
            <p className={styles.stepDescription}>
              Select a pricing plan that fits your needs and complete payment via QR code.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>We Work On It</h3>
            <p className={styles.stepDescription}>
              Our expert team researches and writes your paper according to your specifications.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Download & Review</h3>
            <p className={styles.stepDescription}>
              Receive your completed paper and report. Download from your dashboard anytime.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
        <div className={styles.testimonialsGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Excellent Service</CardTitle>
              <CardDescription>Engineering Student</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                "The research paper was delivered on time and exceeded my expectations. The quality was outstanding and
                helped me score excellent grades."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Work</CardTitle>
              <CardDescription>MBA Candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                "I was impressed by the depth of research and professional presentation. The team understood my
                requirements perfectly."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highly Recommended</CardTitle>
              <CardDescription>Medical Researcher</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                "Fast turnaround, excellent quality, and great support. I've used their service multiple times and
                always satisfied."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How long does it take to complete a research paper?</AccordionTrigger>
              <AccordionContent>
                Delivery time depends on your chosen plan and deadline. Our Basic plan delivers in 7 days, Standard in 5
                days, and Premium in 3 days. Custom plans have flexible timelines based on your requirements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is the work plagiarism-free?</AccordionTrigger>
              <AccordionContent>
                Yes, all our work is 100% original and plagiarism-free. We include a plagiarism check report with every
                order to ensure authenticity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What citation styles do you support?</AccordionTrigger>
              <AccordionContent>
                We support all major citation styles including APA, MLA, IEEE, Chicago, and Harvard. You can specify
                your preferred style when placing an order.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can I request revisions?</AccordionTrigger>
              <AccordionContent>
                Yes, revisions are included based on your plan. Basic includes 1 revision, Standard includes 2, and
                Premium includes 3 revisions. Custom plans offer unlimited revisions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I make payment?</AccordionTrigger>
              <AccordionContent>
                After placing your order, you'll receive a QR code for payment. Simply scan and pay, then upload a
                screenshot of the payment confirmation. Our team will verify and start working on your order.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  );
}
