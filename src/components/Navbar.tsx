import { useContext, useState, useEffect, useRef } from "react";
import { 
  Bell, Search, Menu, X, FileText, Calendar, GraduationCap,
  LayoutDashboard, Bot, StickyNote, Layers, BrainCircuit,
  TrendingUp, History, Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const PAGES = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
  { name: "Study Planner", path: "/planner", icon: Calendar },
  { name: "Notes", path: "/notes", icon: StickyNote },
  { name: "Flashcards", path: "/flashcards", icon: Layers },
  { name: "Quizzes", path: "/quizzes", icon: BrainCircuit },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Study History", path: "/history", icon: History },
  { name: "Exams", path: "/exams", icon: GraduationCap },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{tasks: any[], notes: any[], exams: any[]}>({ tasks: [], notes: [], exams: [] });
  const [pageResults, setPageResults] = useState<typeof PAGES>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], notes: [], exams: [] });
      setPageResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    const q = query.toLowerCase();
    const filteredPages = PAGES.filter(p => 
      p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
    );
    setPageResults(filteredPages);

    setIsSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isOpen) {
      if (pageResults.length > 0) {
        navigate(pageResults[0].path);
        setIsOpen(false);
      } else if (results.tasks.length > 0) {
        navigate("/planner");
        setIsOpen(false);
      } else if (results.notes.length > 0) {
        navigate("/notes");
        setIsOpen(false);
      } else if (results.exams.length > 0) {
        navigate("/exams");
        setIsOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 gap-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 shrink-0"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query) setIsOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, notes, tasks..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {query && (
            <button onClick={() => { setQuery(""); setIsOpen(false); }} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Dropdown */}
          {isOpen && query.trim() && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-[400px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                  Searching...
                </div>
              ) : pageResults.length === 0 && results.tasks.length === 0 && results.notes.length === 0 && results.exams.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {pageResults.length > 0 && (
                    <div className="p-3 border-b border-slate-100 last:border-0">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Pages</h3>
                      <div className="space-y-1">
                        {pageResults.map((page) => {
                          const Icon = page.icon;
                          return (
                            <Link key={page.path} to={page.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                              <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="text-sm font-medium text-slate-900">{page.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {results.notes.length > 0 && (
                    <div className="p-3 border-b border-slate-100 last:border-0">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Notes</h3>
                      <div className="space-y-1">
                        {results.notes.map((note) => (
                          <Link key={note._id} to="/notes" onClick={() => setIsOpen(false)} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                            <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{note.title}</p>
                              <p className="text-xs text-slate-500">{note.subject}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.tasks.length > 0 && (
                    <div className="p-3 border-b border-slate-100 last:border-0">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Tasks</h3>
                      <div className="space-y-1">
                        {results.tasks.map((task) => (
                          <Link key={task._id} to="/planner" onClick={() => setIsOpen(false)} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                            <Calendar className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{task.title}</p>
                              <p className="text-xs text-slate-500">{task.subject} • {task.status}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.exams.length > 0 && (
                    <div className="p-3 border-b border-slate-100 last:border-0">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Exams</h3>
                      <div className="space-y-1">
                        {results.exams.map((exam) => (
                          <Link key={exam._id} to="/exams" onClick={() => setIsOpen(false)} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                            <GraduationCap className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{exam.examName}</p>
                              <p className="text-xs text-slate-500">{exam.subject}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-800 text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 leading-tight">Computer Science</p>
          </div>
        </div>
      </div>
    </header>
  );
}
