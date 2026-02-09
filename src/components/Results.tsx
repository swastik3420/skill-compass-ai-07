import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TrendingUp, Briefcase, BookOpen, Award, ArrowRight, Star, MapPin, Clock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { ParsedResume } from "@/lib/api/career";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  match: number;
  skills: string[];
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    match: 92,
    skills: ["React", "JavaScript", "TypeScript"]
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    type: "Full-time",
    match: 85,
    skills: ["Node.js", "React", "SQL"]
  },
  {
    id: 3,
    title: "Junior Web Developer",
    company: "Digital Agency Co",
    location: "New York, NY",
    type: "Full-time",
    match: 78,
    skills: ["JavaScript", "React", "CSS"]
  }
];

const suggestedSkills = [
  { skill: "GraphQL", reason: "High demand in modern web development" },
  { skill: "Docker", reason: "Essential for deployment and DevOps" },
  { skill: "Testing (Jest/Vitest)", reason: "Improves code quality and employability" },
  { skill: "System Design", reason: "Required for senior roles" }
];

interface ResultsProps {
  results: SkillResult[];
  onRestart: () => void;
  parsedResume?: ParsedResume | null;
}

const Results = ({ results, onRestart, parsedResume }: ResultsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const overallScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  const saveResults = async () => {
    if (!user) {
      toast({
        title: "Sign in to save",
        description: "Create an account to save your assessment results.",
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('assessment_results')
        .insert([{
          user_id: user.id,
          skills: JSON.parse(JSON.stringify(parsedResume?.skills || [])),
          experience_level: parsedResume?.experienceLevel || null,
          summary: parsedResume?.summary || null,
          job_titles: parsedResume?.jobTitles || [],
          industries: parsedResume?.industries || [],
          assessment_scores: JSON.parse(JSON.stringify(results)),
        }]);

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Results saved!",
        description: "Your assessment has been saved to your dashboard.",
      });
    } catch (err) {
      console.error('Error saving results:', err);
      toast({
        title: "Error",
        description: "Failed to save results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <section className="py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl mb-6">
              <Award className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Career Assessment Results
            </h2>
            <p className="text-muted-foreground">
              Based on your resume and assessment, here's your skill profile
            </p>
          </motion.div>

          {/* Save Banner */}
          {!isSaved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <h4 className="font-medium text-foreground">
                  {user ? "Save your results" : "Create an account to save your results"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track your career progress and access your assessment history anytime
                </p>
              </div>
              <Button 
                variant="hero" 
                onClick={saveResults}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {user ? "Save Results" : "Sign Up & Save"}
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success/10 border border-success/20 rounded-xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <h4 className="font-medium text-foreground">Results saved successfully!</h4>
                <p className="text-sm text-muted-foreground">
                  View all your assessments in your dashboard
                </p>
              </div>
              <Link to="/dashboard">
                <Button variant="success">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Skill Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-semibold text-foreground">Skill Evaluation</h3>
                </div>

                <div className="space-y-6">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{result.skill}</span>
                          <span className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                            {result.level}
                          </span>
                        </div>
                        <span className={`font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${getProgressColor(result.score)}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-semibold text-foreground">Recommended Skills to Learn</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestedSkills.map((item, index) => (
                    <motion.div
                      key={item.skill}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-secondary" />
                        <span className="font-medium text-foreground">{item.skill}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Overall Score & Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Overall Score Card */}
              <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 text-center">
                <h4 className="text-muted-foreground mb-4">Overall Score</h4>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="12"
                      strokeDasharray={`${overallScore * 3.52} 352`}
                      initial={{ strokeDasharray: "0 352" }}
                      animate={{ strokeDasharray: `${overallScore * 3.52} 352` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{overallScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {overallScore >= 80 
                    ? "Excellent! You're highly skilled" 
                    : overallScore >= 60 
                      ? "Good foundation with room to grow"
                      : "Focus on building core skills"}
                </p>
              </div>

              {/* Job Matches */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-6 h-6 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">Matching Jobs</h3>
                </div>

                <div className="space-y-4">
                  {mockJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <span className="px-2 py-1 bg-success/20 text-success rounded-md text-xs font-medium">
                          {job.match}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.type}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button variant="secondary" className="w-full mt-4">
                  View All Jobs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-4 mt-12"
          >
            <Button variant="hero-outline" size="lg" onClick={onRestart}>
              Take New Assessment
            </Button>
            {user && (
              <Link to="/dashboard">
                <Button variant="hero" size="lg">
                  View Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Results;
