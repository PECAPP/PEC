import { motion } from "framer-motion";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const jobs = [
  {
    title: "Senior Full Stack Engineer",
    location: "Remote",
    type: "Full-time",
    description: "Build scalable education technology with React, Node.js, and cloud infrastructure.",
  },
  {
    title: "Product Manager",
    location: "New York, USA",
    type: "Full-time",
    description: "Lead product strategy and vision for the higher education market.",
  },
  {
    title: "Customer Success Manager",
    location: "Remote",
    type: "Full-time",
    description: "Support and onboard our institutional customers to ensure success.",
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    type: "Full-time",
    description: "Design beautiful, intuitive interfaces for education administrators.",
  },
];

export function Careers() {
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
          Join Our
          <br />
          <span className="text-gradient">
            Team
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Help us transform higher education. We're hiring talented people who are passionate about making a difference.
        </motion.p>
      </div>

      {/* Job Listings */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {jobs.map((job, i) => (
          <motion.div
            key={job.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                {job.type}
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{job.description}</p>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Careers;
