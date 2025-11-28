import { Link } from "wouter";
import { ArrowRight, Server, Shield, Zap, Cloud, Database, Cpu, HardDrive, Globe, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TbBrandMinecraft } from "react-icons/tb";
import { useState, useEffect } from "react";
import type { Settings } from "@shared/schema";

const floatingIcons = [
  { Icon: TbBrandMinecraft, className: "top-[15%] left-[8%]", delay: "0s", size: "w-12 h-12" },
  { Icon: Server, className: "top-[25%] right-[12%]", delay: "1s", size: "w-8 h-8" },
  { Icon: Cloud, className: "top-[60%] left-[5%]", delay: "2s", size: "w-9 h-9" },
  { Icon: Database, className: "bottom-[30%] right-[8%]", delay: "0.5s", size: "w-7 h-7" },
  { Icon: Cpu, className: "top-[40%] left-[15%]", delay: "1.5s", size: "w-6 h-6" },
  { Icon: HardDrive, className: "top-[70%] right-[15%]", delay: "2.5s", size: "w-8 h-8" },
  { Icon: Globe, className: "top-[10%] right-[25%]", delay: "3s", size: "w-7 h-7" },
  { Icon: Box, className: "bottom-[20%] left-[20%]", delay: "1.8s", size: "w-6 h-6" },
];

interface HeroProps {
  settings?: Settings | null;
}

// Default gradient for fallback
const defaultGradients = {
  light: "linear-gradient(135deg, rgba(255, 127, 80, 0.1) 0%, rgba(70, 130, 180, 0.05) 100%)",
  dark: "linear-gradient(135deg, rgba(255, 165, 0, 0.15) 0%, rgba(70, 130, 180, 0.1) 100%)"
};

export function Hero({ settings }: HeroProps) {
  const [isDark, setIsDark] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
      setImageFailed(false);
      setImageLoaded(false);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const heroTitleLine1 = settings?.heroTitleLine1 || "Cloud Hosting That";
  const heroTitleLine2 = settings?.heroTitleLine2 || "Rises Above";
  const heroDescription = settings?.heroDescription || "Experience blazing-fast performance with Phoenix Cloud. 99.9% uptime guarantee, instant scaling, and 24/7 expert support.";
  const stat1Value = settings?.stat1Value || "99.9%";
  const stat1Label = settings?.stat1Label || "Uptime SLA";
  const stat2Value = settings?.stat2Value || "50+";
  const stat2Label = settings?.stat2Label || "Global Locations";
  const stat3Value = settings?.stat3Value || "24/7";
  const stat3Label = settings?.stat3Label || "Expert Support";
  
  // Get background image for current theme
  const backgroundImage = isDark ? settings?.backgroundImageDark : settings?.backgroundImageLight;
  
  // Validate image URL
  const isValidImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    return url.trim().length > 0 && (url.startsWith('http') || url.startsWith('data:'));
  };

  const shouldShowImage = isValidImageUrl(backgroundImage) && !imageFailed;

  return (
    <section className="relative overflow-hidden">
      {/* Background image layer with error handling */}
      {shouldShowImage && (
        <img
          src={backgroundImage}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          style={{
            backgroundAttachment: 'fixed',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      )}
      
      {/* Fallback gradient if no image or image fails to load */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark ? defaultGradients.dark : defaultGradients.light,
          zIndex: shouldShowImage ? 0 : 1,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {floatingIcons.map(({ Icon, className, delay, size }, index) => (
        <div
          key={index}
          className={`absolute ${className} opacity-20 dark:opacity-30 pointer-events-none z-0`}
          style={{
            animation: `float 6s ease-in-out infinite`,
            animationDelay: delay,
          }}
        >
          <Icon className={`${size} text-primary`} />
        </div>
      ))}
      
      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">All systems operational</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {heroTitleLine1}
            <span className="block text-primary">{heroTitleLine2}</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {heroDescription}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/plans">
              <Button size="lg" data-testid="button-hero-view-plans">
                View Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/support">
              <Button size="lg" variant="outline" data-testid="button-hero-contact">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat1Value}</p>
              <p className="text-sm text-muted-foreground">{stat1Label}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat2Value}</p>
              <p className="text-sm text-muted-foreground">{stat2Label}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat3Value}</p>
              <p className="text-sm text-muted-foreground">{stat3Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
