import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { useWebsiteData } from "@/lib/useWebsiteData";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GlobalBackground } from "@/components/GlobalBackground";

// Pages
import Home from "@/pages/Home";
import Plans from "@/pages/Plans";
import About from "@/pages/About";
import Support from "@/pages/Support";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import RefundPolicy from "@/pages/RefundPolicy";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return <Component />;
}

function Router() {
  const { categories, plans, settings, isLoading } = useWebsiteData();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <GlobalBackground settings={settings} />
      <Switch>
      <Route path="/" component={() => <Home categories={categories} />} />
      <Route path="/plans" component={() => <Plans categories={categories} plans={plans} redirectLink={settings.redirectLink} />} />
      <Route path="/plans/:categorySlug" component={() => <Plans categories={categories} plans={plans} redirectLink={settings.redirectLink} />} />
      <Route path="/plans/:categorySlug/:subcategorySlug" component={() => <Plans categories={categories} plans={plans} redirectLink={settings.redirectLink} />} />
      <Route path="/about" component={() => <About categories={categories} />} />
      <Route path="/support" component={() => <Support categories={categories} discordLink={settings.supportLink} />} />
      <Route path="/terms" component={() => <Terms categories={categories} />} />
      <Route path="/privacy" component={() => <Privacy categories={categories} />} />
      <Route path="/refund-policy" component={() => <RefundPolicy categories={categories} />} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
