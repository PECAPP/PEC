import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "Perfect for small institutions",
    features: {
      "Up to 500 students": true,
      "Up to 5,000 students": false,
      "Unlimited students": false,
      "Basic modules": true,
      "All modules": false,
      "White-label": false,
      "Email support": true,
      "Priority support": false,
      "24/7 dedicated support": false,
      "2 admin accounts": true,
      "10 admin accounts": false,
      "Unlimited admins": false,
      "Monthly backups": true,
      "Daily backups": false,
      "Real-time backups": false,
      "Advanced analytics": false,
      "Custom integrations": false,
      "Custom development": false,
      "SLA guarantee": false,
    },
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$799",
    period: "/month",
    description: "For growing institutions",
    features: {
      "Up to 500 students": true,
      "Up to 5,000 students": true,
      "Unlimited students": false,
      "Basic modules": true,
      "All modules": true,
      "White-label": false,
      "Email support": true,
      "Priority support": true,
      "24/7 dedicated support": false,
      "2 admin accounts": true,
      "10 admin accounts": true,
      "Unlimited admins": false,
      "Monthly backups": true,
      "Daily backups": true,
      "Real-time backups": false,
      "Advanced analytics": true,
      "Custom integrations": true,
      "Custom development": false,
      "SLA guarantee": false,
    },
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large-scale operations",
    features: {
      "Up to 500 students": true,
      "Up to 5,000 students": true,
      "Unlimited students": true,
      "Basic modules": true,
      "All modules": true,
      "White-label": true,
      "Email support": true,
      "Priority support": true,
      "24/7 dedicated support": true,
      "2 admin accounts": true,
      "10 admin accounts": true,
      "Unlimited admins": true,
      "Monthly backups": true,
      "Daily backups": true,
      "Real-time backups": true,
      "Advanced analytics": true,
      "Custom integrations": true,
      "Custom development": true,
      "SLA guarantee": true,
    },
    cta: "Contact Sales",
    highlighted: false,
  },
];

const allFeatures = Object.keys(plans[0].features);

export function Pricing() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-12 lg:mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
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
          className="text-lg lg:text-xl text-muted-foreground"
        >
          Choose the perfect plan for your institution. All plans include a 14-day free trial.
        </motion.p>
      </div>

      {/* Mobile Table View */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 mb-8">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-2 text-sm font-semibold text-foreground sticky left-0 bg-background z-10">Feature</th>
                {plans.map((plan, i) => (
                  <th key={plan.name} className={`py-4 px-2 text-center ${
                    plan.highlighted 
                      ? "bg-gradient-to-br from-purple-500 to-purple-600" 
                      : i === 0 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : "bg-gradient-to-br from-orange-500 to-orange-600"
                  } rounded-t-xl`}>
                    <div className="text-white">
                      <div className="text-base font-bold mb-1">{plan.name}</div>
                      <div className="text-2xl font-bold">{plan.price}</div>
                      <div className="text-xs opacity-80">{plan.period}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, idx) => (
                <tr key={feature} className={idx % 2 === 0 ? "bg-secondary/30" : ""}>
                  <td className="py-3 px-2 text-xs text-foreground sticky left-0 bg-background z-10">{feature}</td>
                  {plans.map((plan) => (
                    <td key={`${plan.name}-${feature}`} className="py-3 px-2 text-center">
                      {plan.features[feature] ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-4 px-2 sticky left-0 bg-background z-10"></td>
                {plans.map((plan, i) => (
                  <td key={`cta-${plan.name}`} className="py-4 px-2">
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-white text-foreground hover:bg-white/90 font-semibold text-xs"
                    >
                      <Link to="/onboarding" className="flex items-center justify-center gap-1">
                        {plan.cta}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop Card View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl shadow-purple-500/30 scale-105 border-2 border-white/20"
                  : i === 0
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/20"
                  : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/20"
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 -mt-2">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/80">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-white/80 ml-2">/{plan.period}</span>
              </div>

              <Button
                asChild
                className="w-full mb-8 bg-white text-foreground hover:bg-white/90 font-semibold shadow-lg"
              >
                <Link to="/onboarding" className="flex items-center justify-center gap-2">
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="space-y-4">
                {Object.entries(plan.features).filter(([_, value]) => value).map(([feature]) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing;
