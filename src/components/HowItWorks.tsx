import { Upload, Brain, BarChart3, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Resume",
    description: "Drop your PDF and our AI instantly extracts your skills, experience, and qualifications.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    number: "02",
    icon: Brain,
    title: "Take the Assessment",
    description: "Answer AI-adaptive questions that evolve based on your responses to measure true skill depth.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Discover Your Gaps",
    description: "Get a detailed skill gap analysis with personalized recommendations to level up fast.",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    number: "04",
    icon: Briefcase,
    title: "Get Matched",
    description: "Find roles that actually fit your verified skills — no more guessing or keyword stuffing.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold text-accent tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 font-display tracking-tight">
            Four Steps to Your{" "}
            <span className="gradient-text-vivid">Dream Career</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From resume upload to job match — our AI guides you through a seamless career discovery journey
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/30 to-warning/30 hidden md:block" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Card */}
                  <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div className={`glass-strong rounded-2xl p-7 border ${step.border} hover:shadow-lg transition-all duration-500 group hover:-translate-y-1`}>
                      <div className={`inline-flex items-center gap-3 mb-4 ${isEven ? "md:flex-row-reverse" : ""}`}>
                        <div className={`w-11 h-11 ${step.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                          <step.icon className={`w-5 h-5 ${step.color}`} />
                        </div>
                        <span className={`text-xs font-bold tracking-widest ${step.color} uppercase`}>
                          Step {step.number}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-display mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <div className={`w-10 h-10 rounded-full ${step.bg} border-4 border-background flex items-center justify-center shadow-md`}>
                      <span className={`text-xs font-extrabold ${step.color}`}>{step.number}</span>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
