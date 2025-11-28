import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlanCard, type Plan } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from "lucide-react";
import { Link } from "wouter";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface PlanWithCategory extends Plan {
  categoryId: string;
  subcategoryId: string;
}

interface PlansProps {
  categories?: Category[];
  plans?: PlanWithCategory[];
  discordLink?: string;
  redirectLink?: string;
}

export default function Plans({ 
  categories = [], 
  plans = [],
  discordLink = "#",
  redirectLink = "#"
}: PlansProps) {
  const params = useParams<{ categorySlug?: string; subcategorySlug?: string }>();
  const [filteredPlans, setFilteredPlans] = useState<PlanWithCategory[]>(plans);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    let filtered = plans;
    
    if (params.categorySlug) {
      const category = categories.find(c => c.slug === params.categorySlug);
      setActiveCategory(category || null);
      
      if (category) {
        const subcategoryIds = category.subcategories.map(s => s.id);
        filtered = plans.filter(p => subcategoryIds.includes(p.subcategoryId));
        
        if (params.subcategorySlug) {
          const subcategory = category.subcategories.find(s => s.slug === params.subcategorySlug);
          setActiveSubcategory(subcategory || null);
          if (subcategory) {
            filtered = plans.filter(p => p.subcategoryId === subcategory.id);
          }
        } else {
          setActiveSubcategory(null);
        }
      }
    } else {
      setActiveCategory(null);
      setActiveSubcategory(null);
    }
    
    setFilteredPlans(filtered);
  }, [params.categorySlug, params.subcategorySlug, categories, plans]);

  const getBreadcrumb = () => {
    const parts = ["Plans"];
    if (activeCategory) parts.push(activeCategory.name);
    if (activeSubcategory) parts.push(activeSubcategory.name);
    return parts;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Choose Your Plan
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Flexible hosting solutions for every need. All plans include DDoS protection and 24/7 support.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getBreadcrumb().map((part, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    <span className={index === getBreadcrumb().length - 1 ? "text-foreground font-medium" : ""}>
                      {part}
                    </span>
                  </span>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-testid="button-filter-category">
                    <Filter className="mr-2 h-4 w-4" />
                    {activeCategory ? activeCategory.name : "All Categories"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href="/plans">
                    <DropdownMenuItem data-testid="filter-all">
                      All Categories
                    </DropdownMenuItem>
                  </Link>
                  {categories.map((category) => (
                    <DropdownMenuSub key={category.id}>
                      <DropdownMenuSubTrigger data-testid={`filter-cat-${category.slug}`}>
                        {category.name}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48">
                        <Link href={`/plans/${category.slug}`}>
                          <DropdownMenuItem data-testid={`filter-cat-all-${category.slug}`}>
                            All {category.name}
                          </DropdownMenuItem>
                        </Link>
                        {category.subcategories.map((sub) => (
                          <Link key={sub.id} href={`/plans/${category.slug}/${sub.slug}`}>
                            <DropdownMenuItem data-testid={`filter-sub-${sub.slug}`}>
                              {sub.name}
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        <section className="py-16 page-enter">
          <div className="container mx-auto px-4">
            {filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-enter">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} redirectLink={redirectLink} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No plans available in this category yet.</p>
                <Link href="/plans">
                  <Button variant="outline" className="mt-4" data-testid="button-view-all-plans">
                    View All Plans
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
