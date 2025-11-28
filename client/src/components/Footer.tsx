import { Link } from "wouter";
import { SiDiscord, SiInstagram, SiYoutube } from "react-icons/si";
import { useState, useEffect } from "react";
import type { Settings } from "@shared/schema";
import logoImage from "@assets/a7df999605adaa0fbe275d510814eee2_1764296940838.webp";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<Settings>({ currency: "usd", supportLink: "", redirectLink: "" });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const footerLinks = {
    product: [
      { label: "Plans", href: "/plans" },
      { label: "Features", href: "/#features" },
      { label: "Support", href: "/support" },
    ],
    legal: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    social: [
      { label: "Discord", href: "#", icon: SiDiscord },
      { label: "Instagram", href: settings.instagramLink || "#", icon: SiInstagram },
      { label: "YouTube", href: settings.youtubeLink || "#", icon: SiYoutube },
    ],
  };

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-logo">
              <img src={logoImage} alt="Phoenix Cloud" className="h-9 w-9 rounded" />
              <span className="text-xl font-bold">Phoenix Cloud</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium cloud hosting solutions with 99.9% uptime guarantee. Fast, reliable, and secure.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover-elevate active-elevate-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  data-testid={`link-social-${link.label.toLowerCase()}`}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Phoenix Cloud. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
