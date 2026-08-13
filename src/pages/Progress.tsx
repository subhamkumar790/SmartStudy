import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { Trophy, Target, Flame, TrendingUp, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import api from "../utils/api";

export default function Progress() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, sessionsRes] = await Promise.all([
          api.get("/api/tasks"),
          api.get("/api/study-sessions/history")
        ]);
        setTasks(tasksRes.data);
        setSessions(sessionsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedTasks = tasks.filter(t => t.status === "Completed");
  const totalSeconds = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
      
      const targetDateString = targetDate.toLocaleDateString('en-CA'); 
      
      const dayTasks = tasks.filter(t => {
        if (t.status !== "Completed" || !t.dueDate) return false;
        const taskDateString = new Date(t.dueDate).toLocaleDateString('en-CA');
        return taskDateString === targetDateString;
      });

      const daySessions = sessions.filter(s => {
        if (s.status !== "Finished" || !s.startTime) return false;
        const sessionDateString = new Date(s.startTime).toLocaleDateString('en-CA');
        return sessionDateString === targetDateString;
      });
      
      const totalSecs = daySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
      
      data.push({
        name: dayName,
        hours: Number((totalSecs / 3600).toFixed(1)),
        tasks: dayTasks.length
      });
    }
    
    return data;
  }, [tasks, sessions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Progress</h1>
        <p className="text-slate-500 mt-1">Analytics and insights into your study habits.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          icon={<Clock className="text-blue-600 h-6 w-6" />} 
          title="Total Study Time" 
          value={`${totalHours}h`} 
          trend="Lifetime" 
        />
        <StatsCard 
          icon={<CheckCircle2 className="text-emerald-600 h-6 w-6" />} 
          title="Tasks Completed" 
          value={completedTasks.length.toString()} 
          trend="Lifetime" 
        />
        <StatsCard 
          icon={<Flame className="text-orange-600 h-6 w-6" />} 
          title="Current Streak" 
          value="1 Day" 
          trend="Keep it up!" 
        />
        <StatsCard 
          icon={<Trophy className="text-yellow-600 h-6 w-6" />} 
          title="Productivity Score" 
          value="Great" 
          trend="Based on task velocity" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Study Hours (Last 7 Days)</h2>
              <p className="text-sm text-slate-500">Total time spent focused across all subjects.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tasks Completed</h2>
              <p className="text-sm text-slate-500">Number of study milestones hit daily.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          {icon}
        </div>
        <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp className="h-3 w-3 mr-1" />
          Up
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">{value}</p>
        <p className="text-sm text-slate-500 mt-2">{trend}</p>
      </div>
    </div>
  );
}
