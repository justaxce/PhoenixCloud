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
        <section className="py-16">
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
              <h2>1. Introduction</h2>
              <p>
                Welcome to PheonixCloud ("Company", "we", "our", "us").
                These Terms of Service ("Terms") govern your use of our hosting services, website, panel, Discord server, and all related platforms.
              </p>
              <p>
                By purchasing, accessing, or using our services (including orders made via Discord), you agree to these Terms and our Privacy Policy.
              </p>

              <h2>2. Registration</h2>
              <h3>Account Creation</h3>
              <p>To access our services, customers must register an account in our hosting panel or through our Discord ticket system.</p>
              
              <h3>Required Information</h3>
              <p>We may collect:</p>
              <ul>
                <li>Discord username & ID</li>
                <li>Email (optional, if provided)</li>
                <li>Payment proof (screenshot or transaction ID)</li>
                <li>For certain products (VPS, dedicated hosting), additional details like name/address may be requested</li>
              </ul>

              <h3>Accuracy</h3>
              <p>You agree that all information provided is accurate and updated.</p>

              <h3>Discord Linking</h3>
              <p>Free hosting or panel users are advised to link their Discord account for faster support and verification.</p>

              <h2>3. Free Hosting</h2>
              <h3>Availability</h3>
              <p>Free hosting is provided as a complimentary service.</p>

              <h3>Usage Rules</h3>
              <p>Users must not use free hosting for:</p>
              <ul>
                <li>Illegal content</li>
                <li>Malicious files</li>
                <li>Crypto mining</li>
                <li>Botnets or attacks</li>
                <li>Anything harmful to our infrastructure</li>
              </ul>

              <h3>Limitations</h3>
              <ul>
                <li>Limited resources</li>
                <li>Lower priority support</li>
                <li>Ads or promotional content may be shown</li>
              </ul>

              <h3>Suspension</h3>
              <p>We may suspend or terminate free hosting accounts for any reason, including:</p>
              <ul>
                <li>Terms violation</li>
                <li>Inactivity</li>
                <li>Abuse</li>
              </ul>

              <h3>No Liability</h3>
              <p>We are not responsible for downtime, data loss, or service interruptions on free hosting.</p>

              <h2>4. Paid Hosting</h2>
              <h3>Services Offered</h3>
              <p>We provide:</p>
              <ul>
                <li>Minecraft hosting</li>
                <li>Game hosting</li>
                <li>Web hosting</li>
                <li>VPS hosting</li>
                <li>Bots/other related services</li>
              </ul>

              <h3>Payment</h3>
              <p>Payments are made through Discord (UPI/Bank Transfer/PayPal/etc. based on your offering).</p>

              <h3>Payment Terms</h3>
              <ul>
                <li>Payment must be completed before service activation</li>
                <li>Periodic renewals must be paid before expiry</li>
                <li>Non-payment leads to suspension/termination</li>
              </ul>

              <h3>No Uptime Guarantee</h3>
              <p>Although we target strong uptime, 100% uptime is not guaranteed.</p>

              <h3>Resource Limits</h3>
              <p>If your usage exceeds plan limits, we may:</p>
              <ul>
                <li>Throttle resources</li>
                <li>Request an upgrade</li>
                <li>Suspend or limit your service</li>
              </ul>

              <h2>5. Data Handling</h2>
              <ul>
                <li>Your service files are stored on our servers</li>
                <li>Backups may be provided, but we do not guarantee backups</li>
                <li>PheonixCloud is not responsible for data loss due to hardware failure, human error, or abuse</li>
                <li>If backup protection is offered, you must request to enable it</li>
              </ul>

              <h2>6. Prohibited Activities</h2>
              <p>You may NOT use our services for:</p>
              <ul>
                <li>Malware, viruses, trojans</li>
                <li>Illegal or copyrighted content</li>
                <li>DDoS attacks, hacking, exploits, or phishing</li>
                <li>Crypto mining</li>
                <li>Hosting harmful bots</li>
                <li>Overloading the server</li>
                <li>Activity that harms other customers or networks</li>
              </ul>
              <p>Any violation may lead to immediate suspension without refund.</p>

              <h2>7. Termination & Suspension</h2>
              <p>We may suspend or terminate services if:</p>
              <ul>
                <li>You violate any part of these Terms</li>
                <li>Abuse is detected</li>
                <li>Payment is not made</li>
                <li>Illegal activity is reported</li>
                <li>Server resources are misused</li>
              </ul>
              <p>We may also deny service for behavior harmful to our staff or community.</p>

              <h2>8. Refund Policy</h2>
              <ul>
                <li>Refunds are available within 24 hours of purchase (if service is unused)</li>
                <li>VPS hosting, domains, IPs, or custom services are non-refundable</li>
                <li>No refunds after 24 hours</li>
                <li>Chargebacks automatically result in termination and blacklist</li>
              </ul>

              <h2>9. Limitation of Liability</h2>
              <p>PheonixCloud is not liable for:</p>
              <ul>
                <li>Downtime</li>
                <li>Data loss</li>
                <li>Service disruptions</li>
                <li>Financial loss</li>
                <li>Damage caused by your hosted content or actions</li>
              </ul>
              <p>All service usage is at your own risk.</p>

              <h2>10. VPS Delivery</h2>
              <p>Delivery time may vary due to demand or provisioning delays. We aim for fast activation but delays may occur.</p>

              <h2>11. Technical Support</h2>
              <p>We provide support for:</p>
              <ul>
                <li>Panel issues</li>
                <li>Hosting setup</li>
                <li>Node problems</li>
              </ul>
              <p>We do not support:</p>
              <ul>
                <li>Third-party plugins</li>
                <li>Mods or scripts</li>
                <li>Custom setups not provided by us</li>
              </ul>

              <h2>12. Abuse Protocol</h2>
              <p>Abuse reports must be resolved within 24 hours or your service may be suspended. Repeated violations may incur fees for IP blacklist removal or admin work.</p>

              <h2>13. Acknowledgment</h2>
              <p>By using PheonixCloud services, you agree that you have read, understood, and accepted these Terms.</p>

              <h2>14. SLA (Service-Level Agreement)</h2>
              <ul>
                <li>We aim for 99.5% uptime</li>
                <li>SLA credits may be issued for eligible outages</li>
              </ul>
              <p>SLA does not apply to:</p>
              <ul>
                <li>Free hosting</li>
                <li>User mistakes</li>
                <li>Abuse</li>
                <li>External attacks</li>
                <li>Maintenance</li>
              </ul>

              <h2>15. Account Security</h2>
              <p>You are responsible for:</p>
              <ul>
                <li>Keeping your account safe</li>
                <li>Securing login details</li>
                <li>Reporting unauthorized access</li>
              </ul>
              <p>We are not responsible for account misuse.</p>

              <h2>16. Content Responsibility</h2>
              <p>You own your content, but must ensure:</p>
              <ul>
                <li>It is legal</li>
                <li>It does not violate copyright</li>
                <li>It does not harm others</li>
              </ul>
              <p>Illegal content results in immediate suspension.</p>

              <h2>17. Fair Use & Resource Abuse</h2>
              <p>Not allowed:</p>
              <ul>
                <li>High CPU background tasks</li>
                <li>Mining</li>
                <li>Spamming</li>
                <li>Overloading the node</li>
                <li>Constant heavy processes</li>
              </ul>
              <p>We enforce fairness for all users.</p>

              <h2>18. Communication Policy</h2>
              <p>We may send updates via:</p>
              <ul>
                <li>Email</li>
                <li>Discord</li>
                <li>Panel notifications</li>
              </ul>
              <p>You must check messages regularly for service alerts.</p>

              <h2>19. Staff Abuse Policy</h2>
              <p>Any harassment, threats, or disrespect towards PheonixCloud staff will result in an immediate ban, termination, or refusal of service.</p>

              <h2>20. Third-Party Dependencies</h2>
              <p>We use various tools and systems to operate our hosting. We are not responsible for outages or issues caused by third-party services.</p>

              <h2>21. Modifications to Terms</h2>
              <p>We may update these Terms at any time. Material changes will be posted in Discord or on the website. Continued use = acceptance of updated Terms.</p>

              <h2>22. DMCA Policy</h2>
              <ul>
                <li>We comply with takedown notices</li>
                <li>Valid DMCA requests must be acted on immediately</li>
                <li>Repeat violators will be suspended or banned</li>
              </ul>

              <h2>23. Reseller Policy</h2>
              <ul>
                <li>You may not resell VPS or hosting without permission</li>
                <li>Unauthorized reselling leads to termination</li>
                <li>To apply for reselling, open a support ticket</li>
              </ul>

              <h2>24. IP Usage Policy</h2>
              <ul>
                <li>Dedicated IPs must not be misused</li>
                <li>Spamming will result in IP removal</li>
                <li>All IPs remain the property of PheonixCloud or our partners</li>
              </ul>

              <h2>25. Uptime Commitment</h2>
              <p>Detailed uptime target: 99.5% monthly</p>
              <p>Excludes:</p>
              <ul>
                <li>Attacks</li>
                <li>User issues</li>
                <li>Maintenance</li>
                <li>External outages</li>
              </ul>

              <h2>26. Dedicated IP Rules</h2>
              <ul>
                <li>Must not be used for spam</li>
                <li>Abuse leads to removal</li>
                <li>IP reputation is customer responsibility</li>
              </ul>

              <h2>27. Affiliate Program</h2>
              <p>If you offer one:</p>
              <ul>
                <li>Commissions only for valid purchases</li>
                <li>No self-referrals</li>
                <li>Minimum payout threshold</li>
                <li>Violations lead to removal</li>
              </ul>

              <h2>28. Billing Responsibility</h2>
              <p>You are responsible for:</p>
              <ul>
                <li>Checking renewals</li>
                <li>Paying invoices on time</li>
                <li>Ensuring valid contact details</li>
              </ul>
              <p>We are not liable for suspension due to the customer ignoring invoices or messages.</p>

              <h2>29. Final Agreement</h2>
              <p>By using PheonixCloud, you accept this TOS and understand that violations may lead to suspension or termination.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
