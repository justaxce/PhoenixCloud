import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "./CurrencyContext";

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsd?: string;
  priceInr?: string;
  price?: string;
  period: string;
  features: string[];
  popular?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  redirectLink?: string;
}

export function PlanCard({ plan, redirectLink = "#" }: PlanCardProps) {
  const { currency } = useCurrency();
  
  const getPrice = () => {
    if (currency === "inr" && plan.priceInr) {
      return `₹${plan.priceInr}`;
    }
    if (plan.priceUsd) {
      return `$${plan.priceUsd}`;
    }
    return plan.price || "$0";
  };

  const handleOrderNow = () => {
    if (redirectLink && redirectLink !== "#") {
      window.open(redirectLink, "_blank");
    } else {
      console.log("Order clicked for plan:", plan.name);
    }
  };

  return (
    <Card
      className={`relative flex flex-col ${plan.popular ? "border-primary ring-2 ring-primary" : ""}`}
      data-testid={`card-plan-${plan.id}`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="pb-4">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">{getPrice()}</span>
          <span className="text-muted-foreground">/{plan.period}</span>
        </div>
        
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          onClick={handleOrderNow}
          data-testid={`button-order-${plan.id}`}
        >
          Order Now
        </Button>
      </CardFooter>
    </Card>
  );
}
