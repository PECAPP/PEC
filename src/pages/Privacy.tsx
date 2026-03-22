import { motion } from "framer-motion";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-bold text-foreground mb-12"
          style={{ fontFamily: "'Monument Extended', serif" }}
        >
          Privacy Policy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 text-foreground prose-invert"
        >
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              PEC ("we", "us", "our" or "Company") operates the pec.app website and the PEC application.
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when
              you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information Collection and Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect several different types of information for various purposes to provide and improve our Service
              to you, including: Personal Data (name, email address, institution details, etc.), and Usage Data (pages
              visited, time spent, interactions, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Security of Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              The security of your data is important to us, but remember that no method of transmission over the
              Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
              means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@pec.app
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

export default Privacy;
