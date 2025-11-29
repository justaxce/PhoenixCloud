import { Link } from "wouter";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@shared/schema";

interface CTAProps {
  settings?: Settings | null;
}

export function CTA({ settings }: CTAProps) {
  const ctaTitle = settings?.ctaTitle || "Ready to Rise Above?";
  const ctaDescription = settings?.ctaDescription || "Join thousands of satisfied customers who trust Phoenix Cloud for their hosting needs. Get started in minutes.";

  return (
    <section className="py-24 page-enter">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 card-enter">
          <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
            <Flame className="h-96 w-96" />
          </div>
          
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              {ctaTitle}
            </h2>
            <div className="mt-4 text-lg text-primary-foreground/80" dangerouslySetInnerHTML={{ __html: ctaDescription }} />
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/plans">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  data-testid="button-cta-view-plans"
                >
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/support">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  data-testid="button-cta-contact"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
