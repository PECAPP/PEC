import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const posts = [
  {
    id: 1,
    title: "The Future of Higher Education Technology",
    excerpt: "Exploring how modern ERPs are reshaping educational institutions worldwide.",
    date: "Jan 15, 2024",
    author: "Sarah Johnson",
    category: "Technology",
  },
  {
    id: 2,
    title: "Migrating from Legacy Systems: A Success Story",
    excerpt: "Learn how a top university migrated to PEC in just 2 weeks.",
    date: "Jan 10, 2024",
    author: "Mike Chen",
    category: "Case Study",
  },
  {
    id: 3,
    title: "Best Practices for Student Data Management",
    excerpt: "Securing and organizing student information in the digital age.",
    date: "Jan 5, 2024",
    author: "Emma Davis",
    category: "Security",
  },
];

export function Blog() {
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
          Latest from Our
          <br />
          <span className="text-gradient">
            Blog
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          Insights, updates, and stories from the PEC team.
        </motion.p>
      </div>

      {/* Blog Posts */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            <p className="text-muted-foreground mb-4">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">by {post.author}</span>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Blog;
