import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ResumeUpload from "@/components/ResumeUpload";
import SkillAssessment from "@/components/SkillAssessment";
import Results from "@/components/Results";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

type AppState = "landing" | "upload" | "assessment" | "results";

interface SkillResult {
  skill: string;
  score: number;
  level: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<SkillResult[]>([]);

  const handleGetStarted = () => {
    setAppState("upload");
    // Scroll to upload section
    setTimeout(() => {
      document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
  };

  const handleStartAssessment = () => {
    setAppState("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssessmentComplete = (results: SkillResult[]) => {
    setAssessmentResults(results);
    setAppState("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setAppState("landing");
    setUploadedFile(null);
    setAssessmentResults([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {appState === "landing" && (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <Features />
        </>
      )}

      {(appState === "landing" || appState === "upload") && (
        <ResumeUpload 
          onFileUploaded={handleFileUploaded}
          onStartAssessment={handleStartAssessment}
        />
      )}

      {appState === "assessment" && (
        <SkillAssessment onComplete={handleAssessmentComplete} />
      )}

      {appState === "results" && (
        <Results results={assessmentResults} onRestart={handleRestart} />
      )}

      <Footer />
    </div>
  );
};

export default Index;
