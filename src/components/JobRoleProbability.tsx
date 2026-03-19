import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ParsedResume } from "@/lib/api/career";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

interface JobRole {
  role: string;
  probability: number;
}

interface JobRoleProbabilityProps {
  results: SkillResult[];
  parsedResume?: ParsedResume | null;
}

const JobRoleProbability = ({ results, parsedResume }: JobRoleProbabilityProps) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobRoles();
  }, [results, parsedResume]);

  const fetchJobRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-job-roles', {
        body: {
          skills: results.map(r => ({ name: r.skill, score: r.score, level: r.level })),
          experienceLevel: parsedResume?.experienceLevel || 'Unknown',
          industries: parsedResume?.industries || [],
          jobTitles: parsedResume?.jobTitles || [],
        }
      });

      if (error) throw error;
      if (data?.roles) {
        setRoles(data.roles.slice(0, 7));
      }
    } catch (err) {
      console.error('Error predicting job roles:', err);
      // Fallback with generated roles
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBarColor = (probability: number) => {
    if (probability >= 75) return "bg-success";
    if (probability >= 50) return "bg-secondary";
    if (probability >= 30) return "bg-warning";
    return "bg-accent";
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-semibold text-foreground">Probability of Job Role</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Analyzing career fit...</span>
        </div>
      </motion.div>
    );
  }

  if (roles.length === 0) return null;

  const maxProbability = Math.max(...roles.map(r => r.probability));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-secondary" />
        <h3 className="text-xl font-semibold text-foreground">Probability of Job Role</h3>
      </div>

      <div className="space-y-4">
        {roles.map((role, index) => (
          <motion.div
            key={role.role}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate mr-2">{role.role}</span>
              <span className="text-sm font-bold text-foreground flex-shrink-0">{role.probability}%</span>
            </div>
            <div className="h-6 bg-muted rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(role.probability / maxProbability) * 100}%` }}
                transition={{ delay: 0.7 + index * 0.08, duration: 0.6 }}
                className={`h-full rounded-lg ${getBarColor(role.probability)} flex items-center justify-end pr-2`}
              >
                {role.probability >= 30 && (
                  <span className="text-xs font-medium text-white">{role.probability}%</span>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default JobRoleProbability;
