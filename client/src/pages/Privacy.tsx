import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface PrivacyProps {
  categories?: Category[];
}

export default function Privacy({ categories = [] }: PrivacyProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Privacy Policy
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
              <h2>1. Introduction</h2>
              <p>
                Phoenix Cloud ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect personal information that you provide directly to us, including:</p>
              <ul>
                <li>Name and email address</li>
                <li>Billing and payment information</li>
                <li>Account credentials</li>
                <li>Contact information</li>
                <li>Communication preferences</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>When you use our services, we automatically collect:</p>
              <ul>
                <li>IP addresses and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Server logs and performance data</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul>
                <li>Providing and maintaining our services</li>
                <li>Processing payments and transactions</li>
                <li>Sending service-related communications</li>
                <li>Improving our services and user experience</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>Service providers who assist in our operations</li>
                <li>Payment processors for transaction handling</li>
                <li>Law enforcement when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>

              <h2>7. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2>8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookie preferences through your browser settings.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>

              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
              </p>

              <h2>11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us through our Discord server or email at privacy@phoenixcloud.com.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
