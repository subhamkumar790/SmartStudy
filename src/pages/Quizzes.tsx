import { useState } from "react";
import { BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Quizzes() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  
  const [quizData, setQuizData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuizData([]);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    
    try {
      const res = await api.post("/api/ai/generate-quiz", { subject, topic, count, difficulty });
      setQuizData(res.data);
      toast.success("Quiz generated successfully!");
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    setAnswers({ ...answers, [currentIndex]: option });
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    let calculatedScore = 0;
    quizData.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) calculatedScore++;
    });
    setScore(calculatedScore);
    setIsFinished(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {!quizData.length && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <BrainCircuit className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Quiz Generator</h2>
              <p className="text-sm text-slate-500 mt-0.5">Test your knowledge with AI-generated quizzes.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Topic</label>
                <input
                  type="text" required value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Data Structures"
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Number of Questions</label>
                <select
                  value={count} onChange={e => setCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Difficulty</label>
                <select
                  value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                {loading ? "Generating Quiz..." : "Start Quiz"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-500 font-medium">AI is crafting your quiz...</p>
        </div>
      )}

      {quizData.length > 0 && !isFinished && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              Question {currentIndex + 1} of {quizData.length}
            </span>
            <span className="text-sm font-medium text-slate-500">
              Topic: {topic}
            </span>
          </div>
          
          <h3 className="mb-8 text-xl font-bold text-slate-900">
            {quizData[currentIndex].question}
          </h3>

          <div className="space-y-3">
            {quizData[currentIndex].options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  answers[currentIndex] === option
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className={`text-base ${answers[currentIndex] === option ? "font-medium text-blue-900" : "text-slate-700 font-medium"}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={currentIndex === quizData.length - 1 ? handleFinish : handleNext}
              disabled={!answers[currentIndex]}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {currentIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quiz Completed!</h2>
            <div className="my-6 inline-flex h-32 w-32 items-center justify-center rounded-full border-8 border-blue-50 bg-white shadow-sm">
              <span className="text-4xl font-bold text-blue-600">
                {Math.round((score / quizData.length) * 100)}%
              </span>
            </div>
            <p className="text-lg font-medium text-slate-600">
              You scored {score} out of {quizData.length} correct.
            </p>
            <button
              onClick={() => {
                setQuizData([]);
                setTopic("");
                setSubject("");
              }}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Generate New Quiz
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Review Answers</h3>
            {quizData.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div key={idx} className={`rounded-xl border p-6 ${isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <p className="font-semibold text-slate-900">{q.question}</p>
                    {isCorrect ? <CheckCircle className="h-6 w-6 shrink-0 text-emerald-500" /> : <XCircle className="h-6 w-6 shrink-0 text-red-500" />}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-900">Your answer: </span> 
                      <span className={isCorrect ? "font-medium text-emerald-700" : "font-medium text-red-700"}>{answers[idx]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-900">Correct answer: </span> 
                        <span className="font-medium text-emerald-700">{q.correctAnswer}</span>
                      </p>
                    )}
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
                      <p className="font-semibold text-slate-900 mb-1">Explanation:</p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
