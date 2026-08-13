import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bot, 
  Calendar, 
  StickyNote, 
  Layers, 
  BrainCircuit, 
  TrendingUp,
  GraduationCap,
  History,
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { cn } from "../utils/cn";

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
    { name: "Study Planner", path: "/planner", icon: Calendar },
    { name: "Notes", path: "/notes", icon: StickyNote },
    { name: "Flashcards", path: "/flashcards", icon: Layers },
    { name: "Quizzes", path: "/quizzes", icon: BrainCircuit },
    { name: "Progress", path: "/progress", icon: TrendingUp },
    { name: "Study History", path: "/history", icon: History },
    { name: "Exams", path: "/exams", icon: GraduationCap },
  ];

  const bottomItems = [
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "group fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col bg-slate-900 text-white transition-all duration-300 lg:static lg:w-[72px] lg:hover:w-[240px] shrink-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-20 items-center justify-between px-6 pb-2 pt-6 overflow-hidden">
          <div className="flex items-center text-xl font-extrabold tracking-tight whitespace-nowrap">
            <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">SmartStudy</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-[3px] whitespace-nowrap",
                  isActive 
                    ? "bg-white/5 text-white border-blue-600" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                )}
                title={item.name}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="pb-4 pt-2 overflow-hidden">
          {bottomItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white border-l-[3px] border-transparent whitespace-nowrap"
              title={item.name}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-6 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-white/5 border-l-[3px] border-transparent whitespace-nowrap"
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
