import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ParsedResume } from "@/lib/api/career";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

interface JobListing {
  title: string;
  company: string;
  location: string;
  type: string;
  match: number;
  url: string;
  source: string;
  postedDate?: string;
}

interface AIJobSearchProps {
  results: SkillResult[];
  parsedResume?: ParsedResume | null;
}

const AIJobSearch = ({ results, parsedResume }: AIJobSearchProps) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchJobs();
  }, [results, parsedResume]);

  const searchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-jobs', {
        body: {
          skills: results.map(r => ({ name: r.skill, score: r.score, level: r.level })),
          experienceLevel: parsedResume?.experienceLevel || 'Unknown',
          jobTitles: parsedResume?.jobTitles || [],
          industries: parsedResume?.industries || [],
        }
      });

      if (error) throw error;
      if (data?.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-semibold text-foreground">AI-Powered Job Matches</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={searchJobs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Finding matching jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No matching jobs found. Try refreshing.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job, index) => (
            <motion.a
              key={index}
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.08 }}
              className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors group block"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate group-hover:text-secondary transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="px-2 py-1 bg-success/20 text-success rounded-md text-xs font-medium">
                    {job.match}%
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.type}
                </span>
                <span className="px-1.5 py-0.5 bg-card rounded text-[10px]">{job.source}</span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AIJobSearch;
