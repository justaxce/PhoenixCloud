import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

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
        <section className="py-16">
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
            <div className="mx-auto max-w-3xl">
              <Card className="p-8 bg-card text-card-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p className="mb-6 leading-relaxed">
                  Welcome to PheonixCloud Hosting. We are committed to protecting your privacy.
                  This Privacy Policy explains what information we collect, how we use it, and how we keep it safe when you use our hosting services or purchase through Discord.
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-3">1. Account Information</h3>
                <p className="mb-3 leading-relaxed">When you purchase hosting or request support, we may collect:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Your Name or Discord Username</li>
                  <li>Email address (if you choose to provide it)</li>
                  <li>Discord ID (only for account linking and support)</li>
                  <li>Payment proof (screenshots / transaction ID)</li>
                  <li>Basic server details (server name, plan, etc.)</li>
                </ul>
                <p className="mb-6 leading-relaxed">We do not store bank details, card details, or passwords.</p>

                <h3 className="text-xl font-semibold mb-3">2. Usage Information</h3>
                <p className="mb-3 leading-relaxed">To provide hosting services, we collect only essential technical data such as:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>IP address (for panel login security)</li>
                  <li>Server resource usage (CPU, RAM, Storage)</li>
                  <li>Error logs related to your hosted service</li>
                </ul>
                <p className="mb-6 leading-relaxed">This is required for server stability and support.</p>

                <h2 className="text-2xl font-bold mb-4 mt-8">How We Use Your Information</h2>
                <h3 className="text-xl font-semibold mb-3">1. Service Delivery</h3>
                <p className="mb-3 leading-relaxed">We use your information to:</p>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>Create and manage your hosting service</li>
                  <li>Provide customer support</li>
                  <li>Fix issues and maintain server performance</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2. Communication</h3>
                <p className="mb-3 leading-relaxed">We may contact you on Discord or email for:</p>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>Service updates</li>
                  <li>Payment confirmation</li>
                  <li>Support responses</li>
                  <li>Important announcements</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3. Payment Verification</h3>
                <p className="mb-6 leading-relaxed">
                  Since purchases happen through Discord, payment screenshots or transaction IDs are used only to verify your order.
                  We do not store your bank or UPI data.
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Information Sharing</h2>
                <h3 className="text-xl font-semibold mb-3">1. Service Providers</h3>
                <p className="mb-3 leading-relaxed">We may share limited information with:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Datacenter providers (for VPS/Minecraft nodes)</li>
                  <li>DDoS protection providers</li>
                  <li>Panel management systems</li>
                </ul>
                <p className="mb-6 leading-relaxed">Only the required technical information is shared — nothing more.</p>

                <h3 className="text-xl font-semibold mb-3">2. Legal Requirements</h3>
                <p className="mb-6 leading-relaxed">
                  We may disclose information only if required by law or to prevent abuse, fraud, or attacks on our servers.
                  We never sell or trade your data.
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Data Security</h2>
                <p className="mb-3 leading-relaxed">We take reasonable steps to secure your data using:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Secure panel systems</li>
                  <li>Limited staff access</li>
                  <li>Authentication protection</li>
                  <li>Server-side security measures</li>
                </ul>
                <p className="mb-6 leading-relaxed">However, no online service is 100% secure.</p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
                <p className="mb-3 leading-relaxed">You may request at any time:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>To see what data we have</li>
                  <li>To update incorrect information</li>
                  <li>To delete your account and data</li>
                </ul>
                <p className="mb-6 leading-relaxed">Just open a ticket on our Discord server.</p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Children's Privacy</h2>
                <p className="mb-6 leading-relaxed">
                  Our services are not intended for users under 13.
                  If a minor's data is discovered, we will delete it immediately.
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Changes to This Policy</h2>
                <p className="mb-6 leading-relaxed">
                  We may update this Privacy Policy.
                  If we make major changes, we will notify users on our Discord server or website.
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
                <p className="mb-3 leading-relaxed">
                  If you have questions or requests regarding this Privacy Policy:
                </p>
                <p className="leading-relaxed">
                  pheonixcloud.offical@gmail.com
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
