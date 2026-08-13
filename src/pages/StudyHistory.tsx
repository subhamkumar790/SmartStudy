import { useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import api from "../utils/api";
import { format } from "date-fns";

export default function StudyHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [sessionsRes, tasksRes] = await Promise.all([
          api.get("/api/study-sessions/history"),
          api.get("/api/tasks")
        ]);
        setSessions(sessionsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Failed to fetch study history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleDay = (dateStr: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading study history...</div>;
  }

  // Group sessions by day
  const groupedData: { [key: string]: { sessions: any[], tasks: any[], date: Date } } = {};

  sessions.forEach(session => {
    const d = new Date(session.startTime);
    const dateStr = d.toLocaleDateString('en-CA');
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = { sessions: [], tasks: [], date: d };
    }
    groupedData[dateStr].sessions.push(session);
  });

  tasks.filter(t => t.status === "Completed" && t.dueDate).forEach(task => {
    const d = new Date(task.dueDate);
    const dateStr = d.toLocaleDateString('en-CA');
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = { sessions: [], tasks: [], date: d };
    }
    groupedData[dateStr].tasks.push(task);
  });

  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Study History</h1>
        <p className="text-slate-500 mt-1">Review your past study sessions and daily progress.</p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {sortedDates.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Clock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No study history yet</h3>
            <p className="text-slate-500 mt-2">Start a study session from the dashboard to see your progress here.</p>
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const data = groupedData[dateStr];
            const isToday = dateStr === new Date().toLocaleDateString('en-CA');
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = dateStr === yesterday.toLocaleDateString('en-CA');
            
            const totalSeconds = data.sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
            const uniqueSubjects = Array.from(new Set(data.sessions.map(s => s.subject))).join(", ");

            return (
              <div key={dateStr} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleDay(dateStr)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {isToday ? "Today" : isYesterday ? "Yesterday" : format(data.date, "EEEE, MMMM do, yyyy")}
                      </h3>
                      {!isToday && !isYesterday && (
                        <p className="text-sm text-slate-500">{format(data.date, "dd MMM yyyy")}</p>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                        <Clock className="h-4 w-4" /> {formatTime(totalSeconds)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium">
                        <CheckCircle2 className="h-4 w-4" /> {data.tasks.length} tasks
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block text-sm text-slate-500 max-w-[200px] truncate">
                      {uniqueSubjects || "No specific subjects"}
                    </div>
                    {expandedDays[dateStr] ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {expandedDays[dateStr] && (
                  <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                    {data.sessions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Sessions</h4>
                        <div className="space-y-2">
                          {data.sessions.map(session => (
                            <div key={session._id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <div>
                                <p className="font-medium text-slate-900">{session.subject}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{session.topic}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-700">{formatTime(session.duration)}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {format(new Date(session.startTime), "HH:mm")} - {session.endTime ? format(new Date(session.endTime), "HH:mm") : "Ongoing"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {data.tasks.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Completed Tasks</h4>
                        <div className="space-y-2">
                          {data.tasks.map(task => (
                            <div key={task._id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                <p className="text-xs text-slate-500">{task.subject}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
