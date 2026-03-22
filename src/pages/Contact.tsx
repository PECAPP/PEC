import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Contact() {
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
          Get in
          <br />
          <span className="text-gradient">
            Touch
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12 mb-20">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-foreground mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Email</h3>
              <p className="text-muted-foreground">support@pec.app</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="w-6 h-6 text-foreground mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-foreground mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Address</h3>
              <p className="text-muted-foreground">San Francisco, CA, USA</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 bg-card border border-border rounded-xl p-8"
        >
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <Input
                type="text"
                placeholder="How can we help?"
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <Textarea
                placeholder="Tell us more about your inquiry..."
                className="bg-background border-border h-32"
              />
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Send Message
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;
