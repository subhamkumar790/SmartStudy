import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, BookOpen, AlertCircle } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "../utils/cn";

interface Exam {
  _id: string;
  subject: string;
  examName: string;
  examDate: string;
  syllabus: string;
  priority: "Low" | "Medium" | "High";
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newExam, setNewExam] = useState({
    subject: "",
    examName: "",
    examDate: new Date().toISOString().split('T')[0],
    syllabus: "",
    priority: "High" as const
  });

  const fetchExams = async () => {
    try {
      const res = await api.get("/api/exams");
      setExams(res.data);
    } catch (error) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/exams", newExam);
      setExams([...exams, res.data].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()));
      setIsAdding(false);
      setNewExam({ 
        subject: "", 
        examName: "", 
        examDate: new Date().toISOString().split('T')[0], 
        syllabus: "", 
        priority: "High" 
      });
      toast.success("Exam added");
    } catch (error) {
      toast.error("Failed to add exam");
    }
  };

  const deleteExam = async (id: string) => {
    try {
      await api.delete(`/api/exams/${id}`);
      setExams(exams.filter(e => e._id !== id));
      toast.success("Exam deleted");
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exams</h1>
          <p className="text-slate-500 mt-1">Track your upcoming exams and syllabus.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Exam
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Subject</label>
              <input
                type="text" required value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="E.g., Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Exam Name</label>
              <input
                type="text" required value={newExam.examName} onChange={e => setNewExam({...newExam, examName: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Midterm 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date" required value={newExam.examDate} onChange={e => setNewExam({...newExam, examDate: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={newExam.priority} onChange={e => setNewExam({...newExam, priority: e.target.value as any})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Syllabus / Notes</label>
              <input
                type="text" value={newExam.syllabus} onChange={e => setNewExam({...newExam, syllabus: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Chapters 1-5, Focus on derivatives"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="h-[38px] w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
                Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 && !loading ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No upcoming exams found. Add one to get started!
          </div>
        ) : (
          exams.map((exam) => {
            const isSoon = new Date(exam.examDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
            return (
              <div key={exam._id} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset mb-2",
                        exam.priority === "High" ? "bg-red-50 text-red-700 ring-red-600/20" :
                        exam.priority === "Medium" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                        "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      )}>
                        {exam.priority} Priority
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{exam.examName}</h3>
                      <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-1">
                        <BookOpen className="h-4 w-4" /> {exam.subject}
                      </p>
                    </div>
                    <button onClick={() => deleteExam(exam._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Calendar className={cn("h-4 w-4", isSoon ? "text-red-500" : "text-slate-400")} />
                    <span className={cn("font-medium", isSoon && "text-red-600")}>
                      {format(new Date(exam.examDate), 'EEEE, MMM dd, yyyy')}
                    </span>
                    {isSoon && <AlertCircle className="h-4 w-4 text-red-500 ml-auto" />}
                  </div>

                  {exam.syllabus && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Syllabus</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{exam.syllabus}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
