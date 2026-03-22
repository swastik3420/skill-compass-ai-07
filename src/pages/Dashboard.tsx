import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, TrendingUp, Award, Calendar, ChevronRight, 
  LogOut, Loader2, Target, BookOpen, Trash2, Briefcase,
  Clock, CheckCircle2, XCircle, MapPin, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AssessmentResult {
  id: string;
  skills: unknown;
  experience_level: string | null;
  summary: string | null;
  job_titles: string[] | null;
  industries: string[] | null;
  assessment_scores: unknown;
  completed_at: string;
}

interface AssessmentScore {
  skill: string;
  score: number;
  level: string;
}

const Dashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessment_results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssessments(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Assessment deleted",
        description: "The assessment has been removed from your history.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete assessment.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  const latestAssessment = assessments[0];
  const scores = latestAssessment?.assessment_scores as AssessmentScore[] | undefined;
  const skills = latestAssessment?.skills as unknown[] | undefined;
  const averageScore = scores?.length 
    ? Math.round(
        scores.reduce((acc, s) => acc + s.score, 0) / 
        scores.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  Track your career progress and skill development
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/">
                  <Button variant="hero">
                    New Assessment
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assessments</p>
                  <p className="text-2xl font-bold text-foreground">{assessments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Skills Tracked</p>
                  <p className="text-2xl font-bold text-foreground">
                    {skills?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-lg font-bold text-foreground">
                    {latestAssessment?.experience_level || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assessment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Assessment History</h2>
            
            {loadingAssessments ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center shadow-lg">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No assessments yet</h3>
                <p className="text-muted-foreground mb-6">
                  Take your first skill assessment to start tracking your career progress
                </p>
                <Link to="/">
                  <Button variant="hero">
                    Start Assessment
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(assessment.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full">
                            {assessment.experience_level}
                          </span>
                        </div>
                        
                        <p className="text-foreground mb-4">{assessment.summary}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(assessment.assessment_scores as AssessmentScore[] | undefined)?.slice(0, 5).map((score, i) => (
                            <div 
                              key={i}
                              className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full"
                            >
                              <span className="text-sm text-foreground">{score.skill}</span>
                              <span className={`text-xs font-medium ${
                                score.score >= 80 ? 'text-success' :
                                score.score >= 60 ? 'text-secondary' :
                                score.score >= 40 ? 'text-warning' : 'text-destructive'
                              }`}>
                                {score.score}%
                              </span>
                            </div>
                          ))}
                          {((assessment.assessment_scores as AssessmentScore[] | undefined)?.length || 0) > 5 && (
                            <span className="text-sm text-muted-foreground px-3 py-1">
                              +{((assessment.assessment_scores as AssessmentScore[] | undefined)?.length || 0) - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAssessment(assessment.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
