import { FileText, Brain, Target, Briefcase, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Scanning",
    description: "Our AI analyzes your resume to extract skills, experience, and qualifications automatically."
  },
  {
    icon: Brain,
    title: "Adaptive Questions",
    description: "Questions adapt from basic to advanced based on your performance, accurately measuring skill depth."
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Identify exactly where you need to improve with personalized learning recommendations."
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    description: "Get matched with jobs that fit your actual skill level, not just keywords on your resume."
  },
  {
    icon: TrendingUp,
    title: "Career Roadmap",
    description: "See the skills needed for your dream role and track your progress over time."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your resume data is encrypted and never shared with third parties without consent."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Level Up
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Path4U combines AI-powered analysis with practical insights to accelerate your career growth
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
