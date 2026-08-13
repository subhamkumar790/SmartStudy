import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Sparkles } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", subject: "", content: "" });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/api/notes");
      setNotes(res.data);
      if (res.data.length > 0 && !selectedNote) setSelectedNote(res.data[0]);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedNote && selectedNote._id) {
        const res = await api.put(`/api/notes/${selectedNote._id}`, editForm);
        setNotes(notes.map(n => n._id === res.data._id ? res.data : n));
        setSelectedNote(res.data);
        toast.success("Note updated");
      } else {
        const res = await api.post("/api/notes", editForm);
        setNotes([res.data, ...notes]);
        setSelectedNote(res.data);
        toast.success("Note created");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
      toast.success("Note deleted");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleSummarize = async () => {
    if (!selectedNote || !selectedNote.content) return;
    setSummarizing(true);
    try {
      const res = await api.post("/api/ai/summarize", { text: selectedNote.content });
      setEditForm({
        title: `${selectedNote.title} (Summary)`,
        subject: selectedNote.subject,
        content: res.data.text
      });
      setSelectedNote({ ...selectedNote, _id: null }); // Create as new note
      setIsEditing(true);
      toast.success("AI generated summary!");
    } catch (error) {
      toast.error("Failed to summarize note");
    } finally {
      setSummarizing(false);
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar List */}
      <div className="flex w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <button 
            onClick={() => { setSelectedNote(null); setEditForm({title: "", subject: "", content: ""}); setIsEditing(true); }}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Note
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.map(note => (
            <button
              key={note._id}
              onClick={() => { setSelectedNote(note); setIsEditing(false); }}
              className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${selectedNote?._id === note._id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <h3 className="truncate font-medium text-slate-900">{note.title}</h3>
              <p className="truncate text-xs text-slate-500 mt-0.5">{note.subject}</p>
              <p className="mt-2 text-xs text-slate-400">{format(new Date(note.updatedAt), 'MMM dd, yyyy')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor/Viewer */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isEditing ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50/50">
              <div className="flex gap-4 flex-1 mr-4">
                <input 
                  type="text" placeholder="Note Title" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                />
                <input 
                  type="text" placeholder="Subject" value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})}
                  className="w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-transparent">Cancel</button>
                <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">Save Note</button>
              </div>
            </div>
            <textarea
              value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})}
              placeholder="Start writing in Markdown..."
              className="flex-1 resize-none p-8 text-slate-900 focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>
        ) : selectedNote ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{selectedNote.title}</h2>
                <div className="flex gap-3 mt-2 items-center">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">{selectedNote.subject}</span>
                  <span className="text-xs text-slate-500">{format(new Date(selectedNote.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSummarize} disabled={summarizing} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm disabled:opacity-50">
                  <Sparkles className="h-4 w-4" /> {summarizing ? "Summarizing..." : "Summarize"}
                </button>
                <button onClick={() => { setEditForm({title: selectedNote.title, subject: selectedNote.subject, content: selectedNote.content}); setIsEditing(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors border border-transparent">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(selectedNote._id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="markdown-body prose max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-blue-600">
                <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <StickyNote className="mb-4 h-12 w-12 text-slate-300" />
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple fallback icon if not imported
function StickyNote(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>;
}
