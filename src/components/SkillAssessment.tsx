import { useState } from "react";
import { ChevronRight, Clock, Brain, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  skill: string;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  question: string;
  options: string[];
  correctAnswer: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    skill: "JavaScript",
    difficulty: "Basic",
    question: "What is the difference between 'let' and 'const' in JavaScript?",
    options: [
      "'let' allows reassignment while 'const' does not",
      "'const' is faster than 'let'",
      "There is no difference",
      "'let' is for numbers, 'const' is for strings"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    skill: "React",
    difficulty: "Intermediate",
    question: "What hook would you use to perform side effects in a functional component?",
    options: [
      "useState",
      "useReducer",
      "useEffect",
      "useMemo"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    skill: "TypeScript",
    difficulty: "Intermediate",
    question: "What is the purpose of generics in TypeScript?",
    options: [
      "To make code run faster",
      "To create reusable components that work with multiple types",
      "To add comments to code",
      "To compile TypeScript to JavaScript"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    skill: "Node.js",
    difficulty: "Advanced",
    question: "What is the Event Loop in Node.js?",
    options: [
      "A loop that handles user input",
      "A mechanism that handles asynchronous callbacks",
      "A type of for loop",
      "A way to create animations"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    skill: "SQL",
    difficulty: "Basic",
    question: "Which SQL command is used to retrieve data from a database?",
    options: [
      "GET",
      "FETCH",
      "SELECT",
      "RETRIEVE"
    ],
    correctAnswer: 2
  }
];

interface SkillAssessmentProps {
  onComplete: (results: { skill: string; score: number; level: string }[]) => void;
}

const SkillAssessment = ({ onComplete }: SkillAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Calculate results
        const skillScores: Record<string, { correct: number; total: number }> = {};
        mockQuestions.forEach((q, i) => {
          if (!skillScores[q.skill]) {
            skillScores[q.skill] = { correct: 0, total: 0 };
          }
          skillScores[q.skill].total++;
          if (newAnswers[i] === q.correctAnswer) {
            skillScores[q.skill].correct++;
          }
        });

        const results = Object.entries(skillScores).map(([skill, { correct, total }]) => {
          const score = Math.round((correct / total) * 100);
          let level = "Beginner";
          if (score >= 80) level = "Expert";
          else if (score >= 60) level = "Intermediate";
          else if (score >= 40) level = "Developing";
          return { skill, score, level };
        });

        onComplete(results);
      }
    }, 1500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Basic": return "bg-success/20 text-success";
      case "Intermediate": return "bg-warning/20 text-warning";
      case "Advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="w-5 h-5" />
                <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>Skill Assessment</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{question.skill}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-8">
                {question.question}
              </h3>

              <div className="space-y-4 mb-8">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = showFeedback && index === question.correctAnswer;
                  const isWrong = showFeedback && isSelected && index !== question.correctAnswer;

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswerSelect(index)}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4
                        ${isCorrect 
                          ? "bg-success/20 border-2 border-success" 
                          : isWrong 
                            ? "bg-destructive/20 border-2 border-destructive"
                            : isSelected 
                              ? "bg-secondary/20 border-2 border-secondary" 
                              : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                        }
                      `}
                    >
                      <span className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                        ${isCorrect 
                          ? "bg-success text-success-foreground" 
                          : isWrong 
                            ? "bg-destructive text-destructive-foreground"
                            : isSelected 
                              ? "bg-secondary text-secondary-foreground" 
                              : "bg-card text-foreground"
                        }
                      `}>
                        {isCorrect ? <CheckCircle className="w-5 h-5" /> : String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-foreground flex-1">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleNext}
                  disabled={selectedAnswer === null || showFeedback}
                >
                  {currentQuestion < mockQuestions.length - 1 ? "Next Question" : "See Results"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SkillAssessment;
