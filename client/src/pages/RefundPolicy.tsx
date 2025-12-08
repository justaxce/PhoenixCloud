import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CreditCard, AlertCircle, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface RefundPolicyProps {
  categories?: Category[];
}

export default function RefundPolicy({ categories = [] }: RefundPolicyProps) {
  const supportEmail = "support@pheonixcloud.shop";

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl" data-testid="text-refund-title">
                Refund Policy
              </h1>
              <p className="mt-4 text-lg text-muted-foreground" data-testid="text-refund-subtitle">
                Refund & Cancellation Policy
              </p>
              <p className="mt-2 text-muted-foreground">
                We want you to be completely satisfied with our services. Here's our comprehensive refund policy.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-4">
              <Card className="p-6 bg-card text-card-foreground shadow-lg" data-testid="card-refund-eligibility">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Refund Eligibility</h2>
                </div>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We offer refunds under the following conditions:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Service downtime exceeding 24 hours due to our infrastructure issues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Inability to provide the service as described in your plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Technical issues on our end that prevent service delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Cancellation within 24 hours of initial purchase (new customers only)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg" data-testid="card-refund-timeline">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Refund Timeline</h2>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">Processing Time</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary">1-2 days</Badge>
                    <span>Refund request review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary">24 hours</Badge>
                    <span>Approval notification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary">3-7 days</Badge>
                    <span>Payment processing</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Refund Methods</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Original payment method (preferred)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Bank transfer (if original method unavailable)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Store credit (upon request)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg" data-testid="card-non-refundable">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-destructive" />
                  <h2 className="text-2xl font-bold">Non-Refundable Items</h2>
                </div>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  The following items are not eligible for refunds:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Services used for more than 30 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Custom setup fees and one-time configuration charges</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Domain registration fees (as per domain registrar policies)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Third-party software licenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Services terminated due to Terms of Service violations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <span>Bandwidth overages and additional resource usage</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg" data-testid="card-refund-steps">
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">How to Request a Refund</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Contact Support</h3>
                      <p className="text-muted-foreground">
                        Email us at <a href={`mailto:${supportEmail}`} className="text-primary hover:underline" data-testid="link-support-email">{supportEmail}</a> with your refund request
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Provide Details</h3>
                      <p className="text-muted-foreground">Include your order ID, service details, and reason for refund</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Wait for Review</h3>
                      <p className="text-muted-foreground">Our team will review your request within 1-2 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold">Receive Refund</h3>
                      <p className="text-muted-foreground">If approved, refund will be processed to your original payment method</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground shadow-lg" data-testid="card-important-notes">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Important Notes</h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>All refund requests must be submitted in writing via email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>Refunds are processed in the same currency as the original payment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>We reserve the right to refuse refunds for abuse or fraudulent activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>This policy may be updated from time to time. Check this page for the latest version</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>For questions about this policy, contact our support team</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-primary/10 border-primary/20" data-testid="card-need-help">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our support team is available 24/7 to assist you with any questions about our refund policy.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                      data-testid="link-contact-email"
                    >
                      <Mail className="h-4 w-4" />
                      {supportEmail}
                    </a>
                    <span className="text-muted-foreground">or</span>
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <SiDiscord className="h-4 w-4" />
                      Join our Discord server
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
