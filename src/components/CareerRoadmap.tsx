import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Loader2, CheckCircle2, Circle, ArrowRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ParsedResume } from "@/lib/api/career";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

interface RoadmapStep {
  title: string;
  description: string;
  timeframe: string;
  skills: string[];
  completed: boolean;
}

interface RoleRoadmap {
  role: string;
  steps: RoadmapStep[];
}

interface CareerRoadmapProps {
  results: SkillResult[];
  parsedResume?: ParsedResume | null;
}

const CareerRoadmap = ({ results, parsedResume }: CareerRoadmapProps) => {
  const [roadmaps, setRoadmaps] = useState<RoleRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    generateRoadmap();
  }, [results, parsedResume]);

  const generateRoadmap = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-job-roles', {
        body: {
          skills: results.map(r => ({ name: r.skill, score: r.score, level: r.level })),
          experienceLevel: parsedResume?.experienceLevel || 'Unknown',
          industries: parsedResume?.industries || [],
          jobTitles: parsedResume?.jobTitles || [],
          includeRoadmap: true,
        }
      });

      if (error) throw error;

      const topRoles = (data?.roles || []).slice(0, 3);
      const userSkills = results.map(r => r.skill.toLowerCase());

      // Generate roadmaps from top roles
      const generated: RoleRoadmap[] = topRoles.map((role: { role: string; probability: number }) => ({
        role: role.role,
        steps: generateStepsForRole(role.role, role.probability, userSkills),
      }));

      setRoadmaps(generated);
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setRoadmaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStepsForRole = (role: string, probability: number, userSkills: string[]): RoadmapStep[] => {
    const roleSkillMap: Record<string, { title: string; desc: string; time: string; skills: string[] }[]> = {
      default: [
        { title: "Foundation", desc: "Strengthen core programming and problem-solving skills", time: "1-2 months", skills: ["Data Structures", "Algorithms", "Git"] },
        { title: "Specialization", desc: "Deep-dive into domain-specific technologies", time: "2-3 months", skills: ["Frameworks", "Design Patterns", "APIs"] },
        { title: "Portfolio", desc: "Build real projects that showcase your abilities", time: "1-2 months", skills: ["Project Management", "Documentation", "Deployment"] },
        { title: "Interview Prep", desc: "Practice coding challenges and system design", time: "1 month", skills: ["System Design", "Mock Interviews", "Behavioral Prep"] },
      ],
    };

    const steps = (roleSkillMap[role.toLowerCase()] || roleSkillMap.default).map(step => ({
      ...step,
      description: step.desc,
      timeframe: step.time,
      completed: step.skills.some(s => userSkills.includes(s.toLowerCase())),
    }));

    // Mark early steps as completed if probability is high
    if (probability >= 70 && steps.length > 0) steps[0].completed = true;
    if (probability >= 85 && steps.length > 1) steps[1].completed = true;

    return steps;
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Map className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-semibold text-foreground">Career Roadmap</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Building your roadmap...</span>
        </div>
      </motion.div>
    );
  }

  if (roadmaps.length === 0) return null;

  const current = roadmaps[activeRole];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Map className="w-6 h-6 text-secondary" />
        <h3 className="text-xl font-semibold text-foreground">Career Roadmap</h3>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {roadmaps.map((rm, i) => (
          <button
            key={rm.role}
            onClick={() => setActiveRole(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              i === activeRole
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Target className="w-3.5 h-3.5 inline mr-1.5" />
            {rm.role}
          </button>
        ))}
      </div>

      {/* Roadmap timeline */}
      <div className="relative">
        {current.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex gap-4 mb-6 last:mb-0"
          >
            {/* Timeline line & dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed ? "bg-success/20" : "bg-muted"
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              {index < current.steps.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 ${step.completed ? "bg-success/40" : "bg-border"}`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-2 ${step.completed ? "opacity-70" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                  {step.timeframe}
                </span>
                {step.completed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                    Done
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {step.skills.map(skill => (
                  <span
                    key={skill}
                    className="text-[10px] px-2 py-1 rounded-md bg-muted text-foreground font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
        <p className="text-xs text-muted-foreground text-center">
          <ArrowRight className="w-3 h-3 inline mr-1" />
          This roadmap is personalized based on your current skills and the top 3 roles best suited for you.
        </p>
      </div>
    </motion.div>
  );
};

export default CareerRoadmap;
