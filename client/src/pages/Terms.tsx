import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface TermsProps {
  categories?: Category[];
}

export default function Terms({ categories = [] }: TermsProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-muted-foreground">
                Last updated: November 2024
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Phoenix Cloud services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Phoenix Cloud provides cloud hosting services including but not limited to VPS hosting, dedicated servers, and related services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
              </p>

              <h2>3. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul>
                <li>Provide accurate information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with all applicable laws</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not attempt to gain unauthorized access to any systems or networks</li>
              </ul>

              <h2>4. Prohibited Uses</h2>
              <p>You may not use Phoenix Cloud services for:</p>
              <ul>
                <li>Distributing malware or conducting phishing activities</li>
                <li>Hosting content that infringes on intellectual property rights</li>
                <li>Launching DDoS attacks or other network attacks</li>
                <li>Sending spam or unsolicited bulk messages</li>
                <li>Mining cryptocurrency without prior approval</li>
                <li>Any activity that violates local, state, or federal laws</li>
              </ul>

              <h2>5. Payment Terms</h2>
              <p>
                All services are billed in advance on a monthly basis. Failure to pay may result in suspension or termination of services. We reserve the right to change pricing with 30 days notice.
              </p>

              <h2>6. Service Level Agreement</h2>
              <p>
                Phoenix Cloud guarantees 99.9% uptime for all services. In the event we fail to meet this guarantee, customers may be eligible for service credits as outlined in our SLA policy.
              </p>

              <h2>7. Data and Backups</h2>
              <p>
                While we take reasonable measures to protect your data, you are responsible for maintaining your own backups. Phoenix Cloud is not liable for any data loss that may occur.
              </p>

              <h2>8. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                Phoenix Cloud shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or through our website.
              </p>

              <h2>11. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us through our Discord server or email at support@phoenixcloud.com.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
