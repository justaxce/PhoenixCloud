import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, BookOpen, ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface SupportProps {
  categories?: Category[];
  discordLink?: string;
}

const faqs = [
  {
    question: "How do I get started with Phoenix Cloud?",
    answer: "Simply choose a plan that fits your needs, click 'Order Now', and you'll be redirected to our Discord server where our team will help you set up your hosting within minutes.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including PayPal, credit/debit cards, and cryptocurrency. Contact our sales team on Discord for more details.",
  },
  {
    question: "What is your uptime guarantee?",
    answer: "We offer a 99.9% uptime SLA across all our hosting plans. If we fail to meet this guarantee, you'll receive service credits as compensation.",
  },
  {
    question: "Do you offer DDoS protection?",
    answer: "Yes, all our plans include enterprise-grade DDoS protection at no extra cost. Our network can mitigate attacks up to 1Tbps.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Absolutely! You can upgrade your plan at any time. Our team will help migrate your services with minimal downtime.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 support through Discord. Our expert team is always ready to help with any technical issues or questions.",
  },
];

export default function Support({ categories = [], discordLink = "#" }: SupportProps) {
  const handleDiscordClick = () => {
    if (discordLink && discordLink !== "#") {
      window.open(discordLink, "_blank");
    } else {
      console.log("Discord link clicked");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                How Can We Help?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Get the support you need, when you need it. Our team is available 24/7.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="hover-elevate" data-testid="card-support-discord">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <SiDiscord className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Discord Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Join our Discord server for real-time support from our team and community.
                  </p>
                  <Button onClick={handleDiscordClick} data-testid="button-join-discord">
                    Join Discord
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-support-email">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Send us an email and we'll respond within 24 hours.
                  </p>
                  <Button variant="outline" asChild data-testid="button-email-support">
                    <a href="mailto:support@phoenixcloud.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-support-docs">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Browse our comprehensive guides and tutorials.
                  </p>
                  <Button variant="outline" data-testid="button-view-docs">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Docs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-2xl">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
                <p className="text-muted-foreground mb-6">
                  Our support team is available 24/7 to assist you with any questions.
                </p>
                <Button onClick={handleDiscordClick} data-testid="button-contact-support">
                  Contact Support
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
