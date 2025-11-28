import { Link } from "wouter";
import { ArrowRight, Server, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">All systems operational</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Cloud Hosting That
            <span className="block text-primary">Rises Above</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Experience blazing-fast performance with Phoenix Cloud. 
            99.9% uptime guarantee, instant scaling, and 24/7 expert support.
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
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime SLA</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-muted-foreground">Global Locations</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Expert Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
