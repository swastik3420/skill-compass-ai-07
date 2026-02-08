import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { parseResume, extractTextFromPdf, type ParsedResume } from "@/lib/api/career";
import { useToast } from "@/components/ui/use-toast";

interface ResumeUploadProps {
  onFileUploaded: (file: File) => void;
  onStartAssessment: () => void;
  onResumeAnalyzed?: (data: ParsedResume) => void;
}

const ResumeUpload = ({ onFileUploaded, onStartAssessment, onResumeAnalyzed }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith('.pdf'))) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError(null);
    setProcessingStatus("Extracting text from PDF...");
    
    try {
      // Extract text from PDF
      const resumeText = await extractTextFromPdf(uploadedFile);
      console.log('Extracted resume text, length:', resumeText.length);
      
      setProcessingStatus("Analyzing your resume with AI...");
      
      // Parse the resume with AI
      const result = await parseResume(resumeText);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to analyze resume');
      }
      
      console.log('Resume parsed successfully:', result.data);
      setParsedData(result.data);
      setIsProcessing(false);
      setIsReady(true);
      setProcessingStatus("");
      onFileUploaded(uploadedFile);
      onResumeAnalyzed?.(result.data);
      
      toast({
        title: "Resume Analyzed!",
        description: `Found ${result.data.skills.length} skills across ${result.data.skills.map(s => s.category).filter((v, i, a) => a.indexOf(v) === i).length} categories.`,
      });
    } catch (err) {
      console.error('Error processing file:', err);
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : 'Failed to process resume');
      setProcessingStatus("");
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to process resume',
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsReady(false);
    setIsProcessing(false);
    setError(null);
    setParsedData(null);
    setProcessingStatus("");
  };

  return (
    <section id="upload" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upload Your Resume
          </h2>
          <p className="text-muted-foreground">
            Our AI will analyze your resume and create a personalized skill assessment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
              ${isDragging 
                ? "border-secondary bg-secondary/10" 
                : file 
                  ? "border-success bg-success/5" 
                  : "border-border hover:border-secondary/50 bg-card"
              }
            `}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Drag & drop your resume
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    or click to browse (PDF only)
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="secondary">
                    Choose File
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isReady ? 'bg-success/20' : 'bg-secondary/20'}`}>
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                      ) : isReady ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <FileText className="w-6 h-6 text-secondary" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isProcessing ? processingStatus || "Processing..." : isReady ? `${parsedData?.skills.length || 0} skills found` : error ? "Error" : ""}
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={removeFile}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <Button variant="hero" size="lg" onClick={onStartAssessment}>
                Start Skill Assessment
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ResumeUpload;
