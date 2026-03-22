import { motion } from "framer-motion";

export function Cookies() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-bold text-foreground mb-12"
          style={{ fontFamily: "'Monument Extended', serif" }}
        >
          Cookie Policy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 text-foreground"
        >
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small files that are stored on your computer when you visit our website. They help us
              remember your preferences, understand how you use our service, and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function properly. They enable basic functions like
                  page navigation and access to secure areas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Analytical Cookies</h3>
                <p className="text-muted-foreground">
                  We use these cookies to understand how visitors interact with our website and to help identify any errors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Preference Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies remember your preferences and choices to provide a personalized experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse
              cookies or alert you when a cookie is being sent. However, some parts of our website may not function
              properly if you disable cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our cookie policy, please contact us at privacy@pec.app
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

export default Cookies;
