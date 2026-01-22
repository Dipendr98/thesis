import { useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Textarea } from "~/components/ui/textarea/textarea";
import { APP_CONFIG } from "~/config";
import styles from "./_public.contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contact Us</h1>
      <p className={styles.subtitle}>Have questions? We're here to help!</p>

      <div className={styles.grid}>
        <Card className={styles.contactCard}>
          <CardContent>
            <Mail className={styles.contactIcon} />
            <h3>Email</h3>
            <p>{APP_CONFIG.adminEmail}</p>
          </CardContent>
        </Card>

        <Card className={styles.contactCard}>
          <CardContent>
            <MessageCircle className={styles.contactIcon} />
            <h3>WhatsApp</h3>
            <p>{APP_CONFIG.supportWhatsApp}</p>
          </CardContent>
        </Card>

        <Card className={styles.contactCard}>
          <CardContent>
            <Phone className={styles.contactIcon} />
            <h3>Support Hours</h3>
            <p>24/7 Available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          {submitted ? (
            <div className={styles.success}>
              <p>Thank you for your message! We'll get back to you soon.</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <Input id="name" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <Input id="subject" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <Textarea id="message" rows={6} required />
              </div>

              <Button type="submit">Send Message</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
