import { useState, useEffect } from "react";
import { Sparkles, Layers, ArrowRight, ArrowLeft } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Flashcards() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    try {
      const res = await api.post("/api/ai/generate-flashcards", { topic, count });
      setCards(res.data);
      toast.success(`Generated ${res.data.length} flashcards!`);
    } catch (error) {
      toast.error("Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">AI Flashcard Generator</h2>
            <p className="text-sm text-slate-500 mt-0.5">Enter a topic and let AI generate study cards for you.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 mt-6">
          <input
            type="text" required value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="E.g., Operating System Processes"
            className="flex-1 rounded-lg border border-slate-300 py-2.5 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900 placeholder-slate-400"
          />
          <div className="flex gap-4">
            <select
              value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-24 rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
            >
              <option value={5}>5 Cards</option>
              <option value={10}>10 Cards</option>
              <option value={15}>15 Cards</option>
            </select>
            <button type="submit" disabled={loading || !topic} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>

      {cards.length > 0 && (
        <div className="flex flex-col items-center space-y-6">
          <div className="flex w-full items-center justify-between text-sm font-medium text-slate-500">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 ring-1 ring-inset ring-blue-600/20">{topic}</span>
          </div>
          
          <div 
            className="perspective-1000 group h-80 w-full max-w-2xl cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative h-full w-full rounded-2xl shadow-sm transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white p-8 text-center backface-hidden border border-slate-200">
                <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-widest">Question</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{cards[currentIndex].question}</h3>
                <p className="absolute bottom-6 text-xs font-medium text-slate-400">Click to reveal answer</p>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-blue-600 p-8 text-center text-white backface-hidden rotate-y-180 shadow-md">
                <p className="text-sm font-semibold text-blue-200 mb-4 uppercase tracking-widest">Answer</p>
                <p className="text-xl leading-relaxed font-medium">{cards[currentIndex].answer}</p>
                <p className="absolute bottom-6 text-xs font-medium text-blue-300">Click to see question</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <button 
              onClick={prevCard} disabled={currentIndex === 0}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextCard} disabled={currentIndex === cards.length - 1}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {!cards.length && !loading && (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <Layers className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Generate flashcards to start studying</p>
        </div>
      )}
    </div>
  );
}
