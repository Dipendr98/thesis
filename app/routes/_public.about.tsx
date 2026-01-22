import { APP_CONFIG } from "~/config";
import styles from "./_public.about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About {APP_CONFIG.name}</h1>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Who We Are</h2>
          <p>
            {APP_CONFIG.name} is a professional research paper and report writing service dedicated to helping students
            and researchers achieve academic excellence. With years of experience in academic writing, our team of
            expert writers delivers high-quality, original research papers across various disciplines.
          </p>
          <p>
            We understand the challenges students face in balancing coursework, research, and deadlines. That's why we
            offer a reliable, efficient service that ensures you receive well-researched, properly formatted papers that
            meet the highest academic standards.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            Our mission is to empower students and researchers by providing professional academic writing support that
            helps them succeed in their educational journey. We are committed to delivering plagiarism-free,
            meticulously researched papers that adhere to the strictest academic guidelines.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Values</h2>
          <div className={styles.valuesList}>
            <div className={styles.valueCard}>
              <h3>Quality</h3>
              <p>
                We maintain the highest standards of academic writing, ensuring every paper is thoroughly researched and
                professionally written.
              </p>
            </div>

            <div className={styles.valueCard}>
              <h3>Integrity</h3>
              <p>
                All our work is 100% original and plagiarism-free. We believe in academic honesty and ethical writing
                practices.
              </p>
            </div>

            <div className={styles.valueCard}>
              <h3>Reliability</h3>
              <p>
                We respect deadlines and deliver on time, every time. Your success is our priority, and we work
                tirelessly to meet your expectations.
              </p>
            </div>

            <div className={styles.valueCard}>
              <h3>Support</h3>
              <p>
                Our dedicated support team is always available to assist you throughout the process, from order
                placement to final delivery.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Why Choose Us</h2>
          <p>
            With {APP_CONFIG.name}, you get more than just a research paper. You get peace of mind knowing that
            experienced professionals are handling your academic work with care and expertise. Our transparent pricing,
            easy ordering process, and commitment to quality make us the preferred choice for students worldwide.
          </p>
        </section>
      </div>
    </div>
  );
}
