import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ArrowLeft,
  Target,
  Zap,
  Brain
  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";



interface CognitiveTest {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  duration: number;
}

interface TestResult {
  testId: string;
  score: number;
  maxScore: number;
  timeElapsed: number;
  date: Date;
}

const tests: CognitiveTest[] = [
  {
    id: "memory",
    name: "Memory Test",
    description: "Remember and recall number sequences",
    icon: <Heart className="w-6 h-6" />,
    duration: 60
  },
  {
    id: "attention",
    name: "Attention Test",
    description: "Focus and selective attention assessment",
    icon: <Target className="w-6 h-6" />,
    duration: 90
  },
  {
    id: "processing",
    name: "Processing Speed",
    description: "Quick decision making and response time",
    icon: <Zap className="w-6 h-6" />,
    duration: 45
  }
];

const CognitiveHealthPage = () => {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<CognitiveTest | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isTestActive, timeLeft]);

  const startMemoryTest = () => {
    const sequence = Array.from({length: 5}, () => Math.floor(Math.random() * 9) + 1);
    setGameState({
      type: "memory",
      sequence,
      userInput: [],
      currentIndex: 0,
      showSequence: true,
      score: 0
    });
    setTimeLeft(60);
    setIsTestActive(true);
    
    // Hide sequence after 3 seconds
    setTimeout(() => {
      setGameState((prev: any) => ({ ...prev, showSequence: false }));
    }, 3000);
  };

  const startAttentionTest = () => {
    setGameState({
      type: "attention",
      targets: [],
      score: 0,
      totalTargets: 0,
      correctClicks: 0,
      wrongClicks: 0
    });
    setTimeLeft(90);
    setIsTestActive(true);
    generateAttentionTarget();
  };

  const startProcessingTest = () => {
    setGameState({
      type: "processing",
      currentQuestion: generateMathQuestion(),
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0
    });
    setTimeLeft(45);
    setIsTestActive(true);
  };

  const generateAttentionTarget = () => {
    setTimeout(() => {
      if (isTestActive) {
        const target = {
          id: Math.random(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          isTarget: Math.random() > 0.3
        };
        setGameState((prev: any) => ({
          ...prev,
          targets: [...(prev?.targets || []), target],
          totalTargets: (prev?.totalTargets || 0) + (target.isTarget ? 1 : 0)
        }));
        
        // Remove target after 2 seconds
        setTimeout(() => {
          setGameState((prev: any) => ({
            ...prev,
            targets: (prev?.targets || []).filter((t: any) => t.id !== target.id)
          }));
        }, 2000);
        
        if (timeLeft > 0) {
          generateAttentionTarget();
        }
      }
    }, Math.random() * 2000 + 1000);
  };

  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const operations = ["+", "-", "*"];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let answer = 0;
    
    switch (op) {
      case "+": answer = a + b; break;
      case "-": answer = a - b; break;
      case "*": answer = a * b; break;
    }
    
    return { question: `${a} ${op} ${b}`, answer };
  };

  const handleMemoryInput = (digit: number) => {
    if (!gameState || gameState.showSequence) return;
    
    const isCorrect = gameState.sequence[gameState.currentIndex] === digit;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    const nextIndex = gameState.currentIndex + 1;
    
    if (nextIndex >= gameState.sequence.length) {
      // Generate new sequence
      const newSequence = Array.from({length: Math.min(8, 5 + Math.floor(newScore / 5))}, 
        () => Math.floor(Math.random() * 9) + 1);
      setGameState({
        ...gameState,
        sequence: newSequence,
        currentIndex: 0,
        score: newScore,
        showSequence: true
      });
      setTimeout(() => {
        setGameState((prev: any) => ({ ...prev, showSequence: false }));
      }, 3000);
    } else {
      setGameState({
        ...gameState,
        currentIndex: nextIndex,
        score: newScore
      });
    }
  };

  const handleAttentionClick = (target: any) => {
    const newCorrect = gameState.correctClicks + (target.isTarget ? 1 : 0);
    const newWrong = gameState.wrongClicks + (target.isTarget ? 0 : 1);
    
    setGameState({
      ...gameState,
      correctClicks: newCorrect,
      wrongClicks: newWrong,
      score: newCorrect * 2 - newWrong,
      targets: gameState.targets.filter((t: any) => t.id !== target.id)
    });
  };

  const handleProcessingAnswer = (userAnswer: number) => {
    const isCorrect = userAnswer === gameState.currentQuestion.answer;
    const newCorrect = gameState.correctAnswers + (isCorrect ? 1 : 0);
    const newTotal = gameState.totalQuestions + 1;
    
    setGameState({
      ...gameState,
      currentQuestion: generateMathQuestion(),
      correctAnswers: newCorrect,
      totalQuestions: newTotal,
      score: Math.round((newCorrect / newTotal) * 100)
    });
  };

  const finishTest = () => {
    if (!currentTest || !gameState) return;
    
    let finalScore = 0;
    let maxScore = 100;
    
    switch (currentTest.id) {
      case "memory":
        finalScore = gameState.score;
        maxScore = 20;
        break;
      case "attention":
        finalScore = Math.max(0, gameState.score);
        maxScore = gameState.totalTargets * 2;
        break;
      case "processing":
        finalScore = gameState.score;
        maxScore = 100;
        break;
    }
    
    const result: TestResult = {
      testId: currentTest.id,
      score: finalScore,
      maxScore,
      timeElapsed: currentTest.duration - timeLeft,
      date: new Date()
    };
    
    setTestResults([...testResults, result]);
    setIsTestActive(false);
    setCurrentTest(null);
    setGameState(null);
  };

  const startTest = (test: CognitiveTest) => {
    setCurrentTest(test);
    switch (test.id) {
      case "memory": startMemoryTest(); break;
      case "attention": startAttentionTest(); break;
      case "processing": startProcessingTest(); break;
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-3 sm:px-4 py-3 sm:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/health")}
            className="hover:bg-[#4A9B8E10]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Cognitive Health Screener</h1>
              <p className="text-sm text-[#4A5568] font-inter">Monitor cognitive function with brain games</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-6 max-w-4xl mx-auto">
        {!currentTest ? (
          /* Test Selection */
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito">Available Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {tests.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white border border-[#E2E8F0]"
                        onClick={() => startTest(test)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
                              {test.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-base text-[#2D3748] font-nunito truncate">
                                  {test.name}
                                </h3>
                                <Badge 
                                  variant="default"
                                  className="text-xs ml-2 flex-shrink-0 bg-[#38A169] text-white"
                                >
                                  {test.duration}s
                                </Badge>
                              </div>
                              <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                                {test.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            {testResults.length > 0 && (
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito">Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.slice(-3).reverse().map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#4A9B8E20] rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-[#4A9B8E]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#2D3748] font-nunito">
                              {tests.find(t => t.id === result.testId)?.name}
                            </p>
                            <p className="text-xs text-[#4A5568] font-inter">
                              {result.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-[#2D3748] font-nunito">
                            {result.score}/{result.maxScore}
                          </p>
                          <p className="text-xs text-[#4A5568] font-inter">
                            {Math.round((result.score / result.maxScore) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.section>
        ) : (
          /* Active Test */
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Timer */}
            <Card className="bg-white border border-[#E2E8F0]">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2D3748] font-nunito mb-2">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <Progress value={(timeLeft / (currentTest?.duration || 60)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Game Area */}
            <Card className="bg-white border border-[#E2E8F0] min-h-[400px]">
              <CardContent className="p-6">
                {gameState?.type === "memory" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#2D3748] font-nunito mb-4">
                        {gameState.showSequence ? "Remember the sequence:" : "Enter the sequence:"}
                      </h3>
                      {gameState.showSequence && (
                        <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                          {gameState.sequence.map((digit: number, index: number) => (
                            <div key={index} className="w-12 h-12 bg-[#4A9B8E20] rounded-lg flex items-center justify-center text-lg font-bold text-[#4A9B8E]">
                              {digit}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {!gameState.showSequence && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                            <Button
                              key={digit}
                              onClick={() => handleMemoryInput(digit)}
                              className="w-12 h-12 bg-[#F8F5F0] hover:bg-[#4A9B8E20] text-[#2D3748] font-bold border border-[#E2E8F0]"
                            >
                              {digit}
                            </Button>
                          ))}
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-[#4A5568] font-inter">
                            Score: {gameState.score}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {gameState?.type === "attention" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#2D3748] font-nunito mb-4">
                        Click only the blue circles
                      </h3>
                      <p className="text-sm text-[#4A5568] font-inter mb-4">
                        Score: {gameState.score} | Correct: {gameState.correctClicks} | Wrong: {gameState.wrongClicks}
                      </p>
                    </div>
                    
                    <div className="relative w-full h-64 bg-[#F8F5F0] rounded-lg overflow-hidden">
                      {gameState.targets.map((target: any) => (
                        <div
                          key={target.id}
                          className={`absolute w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${
                            target.isTarget 
                              ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/80' 
                              : 'bg-[#F6E05E] hover:bg-[#F6E05E]/80'
                          }`}
                          style={{
                            left: `${target.x}%`,
                            top: `${target.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => handleAttentionClick(target)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {gameState?.type === "processing" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#2D3748] font-nunito mb-4">
                        Quick Math: {gameState.currentQuestion.question}
                      </h3>
                      <p className="text-sm text-[#4A5568] font-inter mb-4">
                        Score: {gameState.score} | Correct: {gameState.correctAnswers}/{gameState.totalQuestions}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                      {gameState.currentQuestion.options.map((option: number, index: number) => (
                        <Button
                          key={index}
                          onClick={() => handleProcessingAnswer(option)}
                          className="h-12 bg-[#F8F5F0] hover:bg-[#4A9B8E20] text-[#2D3748] font-bold border border-[#E2E8F0]"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* End Test Button */}
            <Button
              onClick={() => {
                setIsTestActive(false);
                setCurrentTest(null);
                setGameState(null);
              }}
              variant="outline"
              className="w-full border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748] font-semibold"
            >
              End Test
            </Button>
          </motion.section>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default CognitiveHealthPage;