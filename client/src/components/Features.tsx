import { 
  Zap, 
  Shield, 
  Globe, 
  Server, 
  HeadphonesIcon, 
  Gauge 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Settings } from "@shared/schema";

const defaultFeatures = [
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "NVMe SSD storage and optimized infrastructure for lightning-quick load times.",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Enterprise-grade protection against attacks, keeping your services online.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Strategically located data centers for low latency worldwide.",
  },
  {
    icon: Server,
    title: "Instant Scaling",
    description: "Scale resources up or down instantly based on your needs.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Expert support team available around the clock via Discord and tickets.",
  },
  {
    icon: Gauge,
    title: "99.9% Uptime",
    description: "Industry-leading SLA with guaranteed uptime for your peace of mind.",
  },
];

const icons = [Zap, Shield, Globe, Server, HeadphonesIcon, Gauge];

interface FeaturesProps {
  settings?: Settings | null;
}

export function Features({ settings }: FeaturesProps) {
  const sectionTitle = settings?.featuresSectionTitle || "Why Choose PHEONIX CLOUD?";
  const sectionDescription = settings?.featuresSectionDescription || "Built for performance, reliability, and ease of use.";

  const features = [
    {
      icon: icons[0],
      title: settings?.feature1Title || defaultFeatures[0].title,
      description: settings?.feature1Description || defaultFeatures[0].description,
    },
    {
      icon: icons[1],
      title: settings?.feature2Title || defaultFeatures[1].title,
      description: settings?.feature2Description || defaultFeatures[1].description,
    },
    {
      icon: icons[2],
      title: settings?.feature3Title || defaultFeatures[2].title,
      description: settings?.feature3Description || defaultFeatures[2].description,
    },
    {
      icon: icons[3],
      title: settings?.feature4Title || defaultFeatures[3].title,
      description: settings?.feature4Description || defaultFeatures[3].description,
    },
    {
      icon: icons[4],
      title: settings?.feature5Title || defaultFeatures[4].title,
      description: settings?.feature5Description || defaultFeatures[4].description,
    },
    {
      icon: icons[5],
      title: settings?.feature6Title || defaultFeatures[5].title,
      description: settings?.feature6Description || defaultFeatures[5].description,
    },
  ];

  return (
    <section id="features" className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {sectionTitle}
          </h2>
          <div className="mt-4 text-lg text-muted-foreground" dangerouslySetInnerHTML={{ __html: sectionDescription }} />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-enter">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate card-enter" data-testid={`card-feature-${index}`}>
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <div className="mt-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: feature.description }} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
