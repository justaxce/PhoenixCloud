import { ThemeProvider } from "../ThemeProvider";
import { PlanCard, type Plan } from "../PlanCard";

const mockPlan: Plan = {
  id: "starter",
  name: "Starter VPS",
  description: "Perfect for small projects",
  price: "$9.99",
  period: "month",
  features: [
    "2 vCPU Cores",
    "4 GB RAM",
    "50 GB NVMe SSD",
    "1 TB Bandwidth",
    "DDoS Protection",
    "24/7 Support",
  ],
  popular: true,
};

export default function PlanCardExample() {
  return (
    <ThemeProvider>
      <div className="max-w-sm">
        <PlanCard plan={mockPlan} discordLink="https://discord.gg/example" />
      </div>
    </ThemeProvider>
  );
}
