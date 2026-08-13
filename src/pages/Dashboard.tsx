import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Flame, BookOpen, ChevronRight, Target, Calendar, Sparkles, Trophy, FileText, Plus, Check } from "lucide-react";
import api from "../utils/api";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StudyTimer from "../components/StudyTimer";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, examsRes, sessionsRes, notesRes] = await Promise.all([
          api.get("/api/tasks"),
          api.get("/api/exams"),
          api.get("/api/study-sessions/history"),
          api.get("/api/notes")
        ]);
        setTasks(tasksRes.data);
        setExams(examsRes.data);
        setSessions(sessionsRes.data);
        setNotes(notesRes.data);
      } catch (error: any) {
        if (error?.response?.status !== 401) {
          console.error("Failed to fetch dashboard data", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const completeTask = async (id: string) => {
    try {
      await api.put(`/api/tasks/${id}`, { status: "Completed" });
      triggerRefresh();
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const todayTasks = pendingTasks.slice(0, 4);

  // Study Analytics
  const studyData = (() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const targetDateString = targetDate.toLocaleDateString('en-CA'); 
      
      const daySessions = sessions.filter(s => {
        if (s.status !== "Finished" || !s.startTime) return false;
        const sessionDateString = new Date(s.startTime).toLocaleDateString('en-CA');
        return sessionDateString === targetDateString;
      });
      
      const totalSeconds = daySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
      data.push({
        name: dayName,
        hours: Number((totalSeconds / 3600).toFixed(1))
      });
    }
    return data;
  })();

  const todayStudyHours = studyData[studyData.length - 1].hours;
  const totalWeeklyHours = studyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  const weeklyAverage = (parseFloat(totalWeeklyHours) / 7).toFixed(1);
  const bestDay = studyData.reduce((prev, current) => (prev.hours > current.hours) ? prev : current);

  // Streak logic
  let currentStreak = 0;
  const sessionsByDate = sessions.reduce((acc, curr) => {
    if (curr.startTime) {
      const d = new Date(curr.startTime).toLocaleDateString('en-CA');
      acc[d] = (acc[d] || 0) + (curr.duration || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  let checkDate = new Date();
  let checkDateString = checkDate.toLocaleDateString('en-CA');

  if (!sessionsByDate[checkDateString] || sessionsByDate[checkDateString] === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateString = checkDate.toLocaleDateString('en-CA');
  }

  while (sessionsByDate[checkDateString] && sessionsByDate[checkDateString] > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateString = checkDate.toLocaleDateString('en-CA');
  }

  // Subject Progress
  const subjectProgress: Record<string, { total: number, completed: number }> = {};
  tasks.forEach(t => {
    if (t.subject) {
      if (!subjectProgress[t.subject]) subjectProgress[t.subject] = { total: 0, completed: 0 };
      subjectProgress[t.subject].total++;
      if (t.status === "Completed") subjectProgress[t.subject].completed++;
    }
  });
  const subjectProgressArray = Object.entries(subjectProgress).map(([subject, data]) => ({
    subject,
    percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
  })).sort((a, b) => b.percentage - a.percentage);

  // Goal calculations
  const dailyGoalSeconds = 4 * 3600; // 4 hours
  const todaySeconds = Math.floor(todayStudyHours * 3600);
  const percentCompleted = Math.min(100, Math.round((todaySeconds / dailyGoalSeconds) * 100));
  const remainingSeconds = Math.max(0, dailyGoalSeconds - todaySeconds);
  const hoursRemaining = Math.floor(remainingSeconds / 3600);
  const minutesRemaining = Math.floor((remainingSeconds % 3600) / 60);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back!</h1>
          <p className="text-slate-500 mt-1">Here's a quick overview of your studies today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/planner" className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"><Plus className="w-4 h-4"/> Task</Link>
          <Link to="/notes" className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"><Plus className="w-4 h-4"/> Note</Link>
          <Link to="/exams" className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"><Plus className="w-4 h-4"/> Exam</Link>
          <Link to="/planner" className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm">Start Study <ChevronRight className="w-4 h-4"/></Link>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Goal Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 flex items-center gap-1.5"><Target className="w-4 h-4 text-blue-500"/> Today's Goal</h3>
            <span className="text-xs font-semibold text-slate-700">{todayStudyHours}h / 4h</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentCompleted}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 text-right">{remainingSeconds > 0 ? `${hoursRemaining}h ${minutesRemaining}m remaining` : 'Goal reached! 🎉'}</p>
        </div>

        {/* Streak */}
        <StatsCard icon={<Flame className="text-amber-500" />} title="Study Streak" value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`} subtitle={currentStreak > 0 ? "Keep studying every day!" : "Start your streak today!"} />
        
        {/* Progress */}
        <StatsCard icon={<CheckCircle2 className="text-emerald-500" />} title="Tasks Completed" value={completedTasks.toString()} subtitle="Total completed tasks" />
        
        {/* Exams */}
        <StatsCard icon={<BookOpen className="text-purple-500" />} title="Upcoming Exams" value={exams.length.toString()} subtitle="Scheduled exams" />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
          {/* Today's Tasks */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Today's Tasks</h2>
                <Link to="/planner" className="text-sm font-medium text-blue-600 hover:text-blue-700">All tasks</Link>
              </div>
              <div className="space-y-2">
                {todayTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No tasks for today. Great job!</p>
                ) : (
                  todayTasks.map((task) => (
                    <div key={task._id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                      <button 
                        onClick={() => completeTask(task._id)}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                        title="Mark as complete"
                      >
                        <Check className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate pr-2">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 truncate max-w-[100px]">{task.subject}</span>
                          {task.priority === 'High' && <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Urgent</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          
          {/* Subject Progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Subject Progress</h2>
              {subjectProgressArray.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Add tasks to see progress.</p>
              ) : (
                <div className="space-y-4">
                  {subjectProgressArray.slice(0, 5).map((subj, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 truncate pr-2">{subj.subject}</span>
                        <span className="text-slate-500 shrink-0">{subj.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${subj.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          
          {/* Recent Notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Notes</h2>
                <Link to="/notes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">All</Link>
              </div>
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No notes created yet.</p>
                ) : (
                  notes.slice(0, 4).map(note => (
                    <Link key={note._id} to="/notes" className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-amber-600"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{note.title}</p>
                        <p className="text-xs text-slate-500 truncate">{note.subject}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          
          {/* Weekly Study Analytics */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weekly Study Analytics</h2>
              <p className="text-sm text-slate-500">Last 7 days overview</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{totalWeeklyHours}h Total</div>
              <div className="text-xs text-slate-500">{weeklyAverage}h / day avg</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-600">Best day: <span className="font-medium text-slate-900">{bestDay.name} ({bestDay.hours}h)</span></span>
            <Link to="/history" className="font-medium text-blue-600 hover:text-blue-700">Full History &rarr;</Link>
          </div>
        </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6">
          <StudyTimer onFinish={triggerRefresh} />
          
          {/* Upcoming Exams */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming Exams</h2>
                <Link to="/exams" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
              </div>
              <div className="space-y-3">
                {exams.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming exams</p>
                ) : (
                  exams.slice(0, 3).map((exam) => {
                    const daysRemaining = Math.ceil((new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isApproaching = daysRemaining <= 7 && daysRemaining >= 0;
                    
                    return (
                      <div key={exam._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-medium text-slate-900 text-sm flex items-center gap-1.5 truncate">
                            {isApproaching && <span className="text-amber-500 flex-shrink-0" title="Approaching Soon">⚠️</span>} 
                            <span className="truncate">{exam.examName}</span>
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{exam.subject}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-blue-600">
                            {format(new Date(exam.examDate), 'MMM dd')}
                          </p>
                          <span className="inline-block text-[10px] font-medium text-slate-500 mt-0.5">
                            {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? "Today" : "Passed"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          
          <AiRecommendation tasks={pendingTasks} exams={exams} />
          
          {/* Achievements */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Achievements
              </h2>
              <div className="space-y-3">
                {sessions.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 text-lg">🌱</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">First Steps</p>
                      <p className="text-xs text-slate-500">Completed first study session</p>
                    </div>
                  </div>
                ) : null}
                {currentStreak >= 3 ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 text-lg">🔥</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">On Fire</p>
                      <p className="text-xs text-slate-500">3+ day study streak</p>
                    </div>
                  </div>
                ) : null}
                {completedTasks >= 10 ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 text-lg">⭐</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Task Master</p>
                      <p className="text-xs text-slate-500">10+ tasks completed</p>
                    </div>
                  </div>
                ) : null}
                {sessions.length === 0 && currentStreak < 3 && completedTasks < 10 && (
                  <p className="text-sm text-slate-500 text-center py-2">Complete tasks and study sessions to unlock achievements!</p>
                )}
              </div>
            </div>
        </div>

      </div>
    </div>
  );

}

function StatsCard({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string, subtitle?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm justify-between">
      <div className="flex items-start gap-3.5 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );


}

function AiRecommendation({ tasks, exams }: { tasks: any[], exams: any[] }) {
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchRec = async () => {
      const stored = sessionStorage.getItem("dashboard_ai_rec");
      if (stored) {
        setRecommendation(stored);
        return;
      }
      
      if (tasks.length === 0 && exams.length === 0) {
        setRecommendation("You have no pending tasks or upcoming exams. Take a well-deserved break or review your past notes!");
        return;
      }
      
      setLoading(true);
      try {
        const pendingTasks = tasks.map(t => `${t.title} (${t.subject})`).join(", ");
        const upExams = exams.slice(0,3).map(e => `${e.examName} (${e.subject})`).join(", ");
        
        const message = `Generate a very short 2-sentence study recommendation for today based on these pending tasks: [${pendingTasks}] and upcoming exams: [${upExams}]. Direct the student on what to prioritize today. No markdown formatting. Keep it encouraging.`;
        const res = await api.post("/api/ai/chat", { message });
        const text = res.data.text;
        setRecommendation(text);
        sessionStorage.setItem("dashboard_ai_rec", text);
      } catch (e) {
        setRecommendation("Focus on your upcoming exams and highest priority tasks today!");
      } finally {
        setLoading(false);
      }
    };
    if (tasks.length > 0 || exams.length > 0) {
       fetchRec();
    }
  }, [tasks, exams]);

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm relative overflow-hidden">
      <div className="absolute -right-2 -top-2 opacity-10 pointer-events-none">
         <Sparkles className="w-24 h-24 text-indigo-600" />
      </div>
      <h3 className="mb-2 text-sm font-bold text-indigo-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600" /> 
        AI Study Recommendation
      </h3>
      {loading ? (
        <div className="animate-pulse space-y-2 py-1">
          <div className="h-2 bg-indigo-200/60 rounded w-3/4"></div>
          <div className="h-2 bg-indigo-200/60 rounded w-5/6"></div>
        </div>
      ) : (
        <p className="text-sm text-indigo-800 leading-relaxed pr-6">{recommendation}</p>
      )}
    </div>
  );
}
