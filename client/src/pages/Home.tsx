import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import type { Settings } from "@shared/schema";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface HomeProps {
  categories?: Category[];
}

export default function Home({ categories = [] }: HomeProps) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <Hero settings={settings} />
        <Features settings={settings} />
        <CTA settings={settings} />
      </main>
      <Footer />
    </div>
  );
}
