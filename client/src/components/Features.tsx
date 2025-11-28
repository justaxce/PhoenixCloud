import { 
  Zap, 
  Shield, 
  Globe, 
  Server, 
  HeadphonesIcon, 
  Gauge 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
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

export function Features() {
  return (
    <section id="features" className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Why Choose Phoenix Cloud?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for performance, reliability, and ease of use.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-enter">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate card-enter" data-testid={`card-feature-${index}`}>
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
