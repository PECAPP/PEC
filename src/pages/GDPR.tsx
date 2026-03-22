import { motion } from "framer-motion";

export function GDPR() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-bold text-foreground mb-12"
          style={{ fontFamily: "'Monument Extended', serif" }}
        >
          GDPR Compliance
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 text-foreground"
        >
          <section>
            <h2 className="text-2xl font-bold mb-4">Our GDPR Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              PEC is fully committed to complying with the General Data Protection Regulation (GDPR) and all
              applicable data protection laws. We recognize that data protection is a fundamental right and we take
              this responsibility seriously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Data Rights</h2>
            <p className="text-muted-foreground leading-relaxed">Under GDPR, you have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your data</li>
              <li>Restrict processing of your data</li>
              <li>Receive a copy of your data in portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We process personal data only for specific, explicit, and legitimate purposes. We implement appropriate
              technical and organizational measures to protect your data against unauthorized access, alteration, or
              destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Our DPO</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our GDPR compliance or wish to exercise your data rights, please contact our
              Data Protection Officer at dpo@pec.app
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

export default GDPR;
