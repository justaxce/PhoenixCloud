import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

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
            <div className="mx-auto max-w-3xl space-y-2">
              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-3 leading-relaxed">
                  Welcome to PheonixCloud ("Company", "we", "our", "us").
                  These Terms of Service ("Terms") govern your use of our hosting services, website, panel, Discord server, and all related platforms.
                </p>
                <p className="leading-relaxed">
                  By purchasing, accessing, or using our services (including orders made via Discord), you agree to these Terms and our Privacy Policy.
                </p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">2. Registration</h2>
                <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
                <p className="mb-4 leading-relaxed">To access our services, customers must register an account in our hosting panel or through our Discord ticket system.</p>
                
                <h3 className="text-xl font-semibold mb-3">Required Information</h3>
                <p className="mb-2 leading-relaxed">We may collect:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Discord username & ID</li>
                  <li>Email (optional, if provided)</li>
                  <li>Payment proof (screenshot or transaction ID)</li>
                  <li>For certain products (VPS, dedicated hosting), additional details like name/address may be requested</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Accuracy</h3>
                <p className="mb-4 leading-relaxed">You agree that all information provided is accurate and updated.</p>

                <h3 className="text-xl font-semibold mb-3">Discord Linking</h3>
                <p className="leading-relaxed">Free hosting or panel users are advised to link their Discord account for faster support and verification.</p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">3. Free Hosting</h2>
                <h3 className="text-xl font-semibold mb-3">Availability</h3>
                <p className="mb-4 leading-relaxed">Free hosting is provided as a complimentary service.</p>

                <h3 className="text-xl font-semibold mb-3">Usage Rules</h3>
                <p className="mb-2 leading-relaxed">Users must not use free hosting for:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Illegal content</li>
                  <li>Malicious files</li>
                  <li>Crypto mining</li>
                  <li>Botnets or attacks</li>
                  <li>Anything harmful to our infrastructure</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Limitations</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Limited resources</li>
                  <li>Lower priority support</li>
                  <li>Ads or promotional content may be shown</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Suspension</h3>
                <p className="mb-2 leading-relaxed">We may suspend or terminate free hosting accounts for any reason, including:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Terms violation</li>
                  <li>Inactivity</li>
                  <li>Abuse</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">No Liability</h3>
                <p className="leading-relaxed">We are not responsible for downtime, data loss, or service interruptions on free hosting.</p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">4. Paid Hosting</h2>
                <h3 className="text-xl font-semibold mb-3">Services Offered</h3>
                <p className="mb-2 leading-relaxed">We provide:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Minecraft hosting</li>
                  <li>Game hosting</li>
                  <li>Web hosting</li>
                  <li>VPS hosting</li>
                  <li>Bots/other related services</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Payment</h3>
                <p className="mb-4 leading-relaxed">Payments are made through Discord (UPI/Bank Transfer/PayPal/etc. based on your offering).</p>

                <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Payment must be completed before service activation</li>
                  <li>Periodic renewals must be paid before expiry</li>
                  <li>Non-payment leads to suspension/termination</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">No Uptime Guarantee</h3>
                <p className="mb-4 leading-relaxed">Although we target strong uptime, 100% uptime is not guaranteed.</p>

                <h3 className="text-xl font-semibold mb-3">Resource Limits</h3>
                <p className="mb-2 leading-relaxed">If your usage exceeds plan limits, we may:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Throttle resources</li>
                  <li>Request an upgrade</li>
                  <li>Suspend or limit your service</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">5. Data Handling</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your service files are stored on our servers</li>
                  <li>Backups may be provided, but we do not guarantee backups</li>
                  <li>PheonixCloud is not responsible for data loss due to hardware failure, human error, or abuse</li>
                  <li>If backup protection is offered, you must request to enable it</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">6. Prohibited Activities</h2>
                <p className="mb-3 leading-relaxed">You may NOT use our services for:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Malware, viruses, trojans</li>
                  <li>Illegal or copyrighted content</li>
                  <li>DDoS attacks, hacking, exploits, or phishing</li>
                  <li>Crypto mining</li>
                  <li>Hosting harmful bots</li>
                  <li>Overloading the server</li>
                  <li>Activity that harms other customers or networks</li>
                </ul>
                <p className="leading-relaxed">Any violation may lead to immediate suspension without refund.</p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">7. Termination & Suspension</h2>
                <p className="mb-3 leading-relaxed">We may suspend or terminate services if:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>You violate any part of these Terms</li>
                  <li>Abuse is detected</li>
                  <li>Payment is not made</li>
                  <li>Illegal activity is reported</li>
                  <li>Server resources are misused</li>
                </ul>
                <p className="leading-relaxed">We may also deny service for behavior harmful to our staff or community.</p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">8. Refund Policy</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refunds are available within 24 hours of purchase (if service is unused)</li>
                  <li>VPS hosting, domains, IPs, or custom services are non-refundable</li>
                  <li>No refunds after 24 hours</li>
                  <li>Chargebacks automatically result in termination and blacklist</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p className="mb-3 leading-relaxed">PheonixCloud is not liable for:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Downtime</li>
                  <li>Data loss</li>
                  <li>Service disruptions</li>
                  <li>Financial loss</li>
                  <li>Damage caused by your hosted content or actions</li>
                </ul>
                <p className="leading-relaxed">All service usage is at your own risk.</p>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">10-29. Additional Terms</h2>
                <ul className="space-y-3">
                  <li><strong>10. VPS Delivery:</strong> Delivery time may vary due to demand or provisioning delays.</li>
                  <li><strong>11. Technical Support:</strong> We support panel issues, hosting setup, and node problems. We don't support third-party plugins or custom setups.</li>
                  <li><strong>12. Abuse Protocol:</strong> Abuse reports must be resolved within 24 hours or service may be suspended.</li>
                  <li><strong>13. Acknowledgment:</strong> By using PheonixCloud, you agree you have read and accepted these Terms.</li>
                  <li><strong>14. SLA:</strong> We aim for 99.5% uptime. SLA doesn't apply to free hosting, user mistakes, abuse, attacks, or maintenance.</li>
                  <li><strong>15. Account Security:</strong> You are responsible for keeping your account safe and reporting unauthorized access.</li>
                  <li><strong>16. Content Responsibility:</strong> You own your content but must ensure it's legal and doesn't violate copyright.</li>
                  <li><strong>17. Fair Use:</strong> No high CPU tasks, mining, spamming, or overloading the node.</li>
                  <li><strong>18. Communication:</strong> We may send updates via email, Discord, or panel notifications.</li>
                  <li><strong>19. Staff Abuse Policy:</strong> Harassment toward staff results in immediate ban or termination.</li>
                  <li><strong>20. Third-Party Dependencies:</strong> We're not responsible for outages caused by third-party services.</li>
                  <li><strong>21. Modifications:</strong> We may update these Terms at any time. Continued use means acceptance.</li>
                  <li><strong>22. DMCA Policy:</strong> We comply with takedown notices and act on valid DMCA requests.</li>
                  <li><strong>23. Reseller Policy:</strong> You may not resell without permission.</li>
                  <li><strong>24. IP Usage:</strong> Dedicated IPs must not be misused. All IPs remain our property.</li>
                  <li><strong>25. Uptime Commitment:</strong> We target 99.5% monthly uptime, excluding attacks, user issues, maintenance, and external outages.</li>
                  <li><strong>26. Dedicated IP Rules:</strong> No spam, abuse leads to removal.</li>
                  <li><strong>27. Affiliate Program:</strong> Commissions for valid purchases only, no self-referrals.</li>
                  <li><strong>28. Billing:</strong> You're responsible for checking renewals and paying invoices on time.</li>
                  <li><strong>29. Final Agreement:</strong> Using PheonixCloud means accepting these Terms.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
