import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Plans from "@/pages/Plans";
import Support from "@/pages/Support";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

// Mock data - todo: remove mock functionality
const mockCategories: Array<{
  id: string;
  name: string;
  slug: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  }>;
}> = [
  {
    id: "1",
    name: "VPS Hosting",
    slug: "vps",
    subcategories: [
      { id: "1a", name: "Linux VPS", slug: "linux", categoryId: "1" },
      { id: "1b", name: "Windows VPS", slug: "windows", categoryId: "1" },
    ],
  },
  {
    id: "2",
    name: "Dedicated Servers",
    slug: "dedicated",
    subcategories: [
      { id: "2a", name: "Intel Servers", slug: "intel", categoryId: "2" },
      { id: "2b", name: "AMD Servers", slug: "amd", categoryId: "2" },
    ],
  },
];

const mockPlans = [
  {
    id: "plan-1",
    name: "Starter VPS",
    description: "Perfect for small projects",
    price: "$9.99",
    period: "month",
    features: ["2 vCPU Cores", "4 GB RAM", "50 GB NVMe SSD", "1 TB Bandwidth", "DDoS Protection"],
    popular: true,
    categoryId: "1",
    subcategoryId: "1a",
  },
  {
    id: "plan-2",
    name: "Pro VPS",
    description: "For growing applications",
    price: "$29.99",
    period: "month",
    features: ["8 vCPU Cores", "16 GB RAM", "200 GB NVMe SSD", "10 TB Bandwidth", "DDoS Protection", "Priority Support"],
    categoryId: "1",
    subcategoryId: "1a",
  },
  {
    id: "plan-3",
    name: "Enterprise VPS",
    description: "For demanding workloads",
    price: "$99.99",
    period: "month",
    features: ["16 vCPU Cores", "64 GB RAM", "1 TB NVMe SSD", "100 TB Bandwidth", "DDoS Protection", "Dedicated Support", "Custom Configuration"],
    categoryId: "1",
    subcategoryId: "1a",
  },
];

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Home categories={mockCategories} />} />
      <Route path="/plans" component={() => <Plans categories={mockCategories} plans={mockPlans} discordLink="https://discord.gg/EX6Dydyar5" />} />
      <Route path="/plans/:categorySlug" component={() => <Plans categories={mockCategories} plans={mockPlans} discordLink="https://discord.gg/EX6Dydyar5" />} />
      <Route path="/plans/:categorySlug/:subcategorySlug" component={() => <Plans categories={mockCategories} plans={mockPlans} discordLink="https://discord.gg/EX6Dydyar5" />} />
      <Route path="/support" component={() => <Support categories={mockCategories} discordLink="https://discord.gg/EX6Dydyar5" />} />
      <Route path="/terms" component={() => <Terms categories={mockCategories} />} />
      <Route path="/privacy" component={() => <Privacy categories={mockCategories} />} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
