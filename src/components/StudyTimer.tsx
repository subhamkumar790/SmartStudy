import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, BookOpen, Tag } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function StudyTimer({ onFinish }: { onFinish?: () => void }) {
  const [session, setSession] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  const fetchActiveSession = async () => {
    try {
      const res = await api.get("/api/study-sessions/active");
      setSession(res.data);
    } catch (error) {
      console.error("Failed to fetch active session", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  useEffect(() => {
    if (session) {
      if (session.status === "Active") {
        const updateTimer = () => {
          const now = new Date().getTime();
          const resumedAt = new Date(session.lastResumedAt).getTime();
          const currentElapsed = session.duration + Math.floor((now - resumedAt) / 1000);
          setElapsed(currentElapsed);
        };
        updateTimer();
        timerRef.current = window.setInterval(updateTimer, 1000);
      } else if (session.status === "Paused") {
        setElapsed(session.duration);
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
        }
      }
    } else {
      setElapsed(0);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [session]);

  const handleStart = async () => {
    if (!subject.trim() || !topic.trim()) {
      toast.error("Please enter a subject and topic");
      return;
    }
    try {
      const res = await api.post("/api/study-sessions/start", { subject, topic });
      setSession(res.data);
      toast.success("Study session started!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start session");
    }
  };

  const handlePause = async () => {
    if (!session) return;
    try {
      const res = await api.put(`/api/study-sessions/${session._id}/pause`);
      setSession(res.data);
    } catch (error: any) {
      toast.error("Failed to pause session");
    }
  };

  const handleResume = async () => {
    if (!session) return;
    try {
      const res = await api.put(`/api/study-sessions/${session._id}/resume`);
      setSession(res.data);
    } catch (error: any) {
      toast.error("Failed to resume session");
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    try {
      await api.put(`/api/study-sessions/${session._id}/finish`);
      setSession(null);
      setSubject("");
      setTopic("");
      setElapsed(0);
      toast.success("Study session finished and saved!");
      if (onFinish) onFinish();
    } catch (error: any) {
      toast.error("Failed to finish session");
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center border border-slate-200 rounded-xl bg-white shadow-sm">Loading timer...</div>;
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          📚 Today's Study
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-blue-950 mb-6 drop-shadow-sm">
          {formatTime(elapsed)}
        </div>
        
        {!session ? (
          <div className="w-full space-y-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BookOpen className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Subject (e.g. DSA)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Topic (e.g. Binary Search)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Play className="h-4 w-4" /> Start Study
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-sm font-medium text-blue-800 bg-blue-100/50 px-3 py-1.5 rounded-full mb-2">
              {session.subject} • {session.topic}
            </div>
            <div className="flex items-center gap-3 w-full">
              {session.status === "Active" ? (
                <button
                  onClick={handlePause}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <Pause className="h-4 w-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Play className="h-4 w-4" /> Resume
                </button>
              )}
              <button
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900 transition-colors shadow-sm"
              >
                <Square className="h-4 w-4" /> Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
