import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, MoreVertical, Trash2, Calendar as CalendarIcon } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "../utils/cn";

interface Task {
  _id: string;
  title: string;
  subject: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  duration: number;
  status: "Pending" | "Completed";
}

export default function Planner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    priority: "Medium",
    dueDate: new Date().toISOString().split('T')[0],
    duration: 30
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/tasks");
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/tasks", newTask);
      setTasks([...tasks, res.data]);
      setIsAdding(false);
      setNewTask({ title: "", subject: "", priority: "Medium", dueDate: new Date().toISOString().split('T')[0], duration: 30 });
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const toggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "Pending" ? "Completed" : "Pending";
      const res = await api.put(`/api/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Study Planner</h1>
          <p className="text-slate-500 mt-1">Organize your tasks and track your progress.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Task Title</label>
              <input
                type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Read Chapter 4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Subject</label>
              <input
                type="text" required value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="DBMS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="date" required value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Mins</label>
                <input
                  type="number" required min="5" step="5" value={newTask.duration} onChange={e => setNewTask({...newTask, duration: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button type="submit" className="h-[38px] rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {tasks.length === 0 && !loading ? (
            <li className="p-8 text-center text-slate-500">No tasks found. Add one to get started!</li>
          ) : (
            tasks.map((task) => (
              <li key={task._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleStatus(task)}
                    className={cn("flex h-6 w-6 items-center justify-center rounded-full border transition-colors", 
                      task.status === "Completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-blue-500 bg-white"
                    )}
                  >
                    {task.status === "Completed" && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </button>
                  <div>
                    <p className={cn("text-sm font-medium text-slate-900", task.status === "Completed" && "line-through text-slate-400")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-blue-600">{task.subject}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.duration}m</span>
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                      <span className={cn(
                        "rounded px-2 py-0.5 font-medium ring-1 ring-inset",
                        task.priority === "High" ? "bg-red-50 text-red-700 ring-red-600/10" :
                        task.priority === "Medium" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                        "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                      )}>{task.priority}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(task._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
