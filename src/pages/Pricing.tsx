import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "Perfect for small institutions",
    features: [
      "Up to 500 students",
      "Basic modules (Admissions, Attendance)",
      "Email support",
      "2 admin accounts",
      "Monthly data backups",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$799",
    period: "/month",
    description: "For growing institutions",
    features: [
      "Up to 5,000 students",
      "All modules included",
      "Priority support",
      "10 admin accounts",
      "Daily data backups",
      "Advanced analytics",
      "Custom integrations",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large-scale operations",
    features: [
      "Unlimited students",
      "All features + white-label",
      "24/7 dedicated support",
      "Unlimited admin accounts",
      "Real-time backups",
      "Custom development",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-bold text-foreground mb-6"
          style={{ fontFamily: "'Monument Extended', serif" }}
        >
          Simple, Transparent
          <br />
          <span className="text-gradient">
            Pricing
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          Choose the perfect plan for your institution. All plans include a 14-day free trial.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-8 transition-all duration-300 ${
              plan.highlighted
                ? "bg-secondary/50 border-2 border-primary shadow-xl scale-105"
                : "bg-card border border-border hover:border-primary/30"
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground ml-2">/{plan.period}</span>
            </div>

            <Button
              asChild
              className={`w-full mb-8 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
            >
              <Link to="/onboarding" className="flex items-center justify-center gap-2">
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <div className="space-y-4">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;
