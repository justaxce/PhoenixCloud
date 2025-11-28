import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Flame, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

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
}

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/support", label: "Support" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Phoenix Cloud</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={location.startsWith("/plans") ? "secondary" : "ghost"}
                data-testid="button-plans-dropdown"
              >
                Plans
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <Link href="/plans">
                <DropdownMenuItem data-testid="link-all-plans">
                  All Plans
                </DropdownMenuItem>
              </Link>
              {categories.map((category) => (
                <DropdownMenuSub key={category.id}>
                  <DropdownMenuSubTrigger data-testid={`menu-category-${category.slug}`}>
                    {category.name}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48">
                    <Link href={`/plans/${category.slug}`}>
                      <DropdownMenuItem data-testid={`link-category-all-${category.slug}`}>
                        All {category.name}
                      </DropdownMenuItem>
                    </Link>
                    {category.subcategories.map((sub) => (
                      <Link key={sub.id} href={`/plans/${category.slug}/${sub.slug}`}>
                        <DropdownMenuItem data-testid={`link-subcategory-${sub.slug}`}>
                          {sub.name}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/terms">
            <Button
              variant={isActive("/terms") ? "secondary" : "ghost"}
              data-testid="link-nav-terms"
            >
              Terms
            </Button>
          </Link>
          <Link href="/privacy">
            <Button
              variant={isActive("/privacy") ? "secondary" : "ghost"}
              data-testid="link-nav-privacy"
            >
              Privacy
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/plans" className="hidden md:block">
            <Button data-testid="button-get-started">Get Started</Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link href="/plans">
              <Button
                variant={location.startsWith("/plans") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-plans"
              >
                Plans
              </Button>
            </Link>
            <Link href="/terms">
              <Button
                variant={isActive("/terms") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-terms"
              >
                Terms
              </Button>
            </Link>
            <Link href="/privacy">
              <Button
                variant={isActive("/privacy") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-privacy"
              >
                Privacy
              </Button>
            </Link>
            <Link href="/plans">
              <Button
                className="w-full mt-2"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-get-started"
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
