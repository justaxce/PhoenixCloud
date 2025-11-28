import { useState, useEffect } from "react";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface SupportProps {
  categories?: Category[];
  discordLink?: string;
}

export default function Support({ categories = [], discordLink = "#" }: SupportProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

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
        <section className="py-16">
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
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-center text-muted-foreground">No FAQs available yet</div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
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
