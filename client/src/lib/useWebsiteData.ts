import { useEffect, useState } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsd: string;
  priceInr: string;
  period: string;
  features: string[];
  popular?: boolean;
  categoryId: string;
  subcategoryId: string;
}

export interface Settings {
  currency: "usd" | "inr";
  supportLink: string;
  redirectLink: string;
}

export interface WebsiteData {
  categories: Category[];
  plans: Plan[];
  settings: Settings;
  isLoading: boolean;
}

export function useWebsiteData(): WebsiteData {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<Settings>({
    currency: "usd",
    supportLink: "https://discord.gg/EX6Dydyar5",
    redirectLink: "https://discord.gg/EX6Dydyar5",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, plansRes, settingsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/plans"),
          fetch("/api/settings"),
        ]);

        if (catsRes.ok) {
          const data = await catsRes.json();
          setCategories(data);
        }
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPlans(data);
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch website data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, plans, settings, isLoading };
}
