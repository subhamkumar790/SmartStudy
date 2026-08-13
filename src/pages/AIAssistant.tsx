import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Trash2, Copy, RefreshCw } from "lucide-react";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "model", text: "Hi there! I'm your AI Study Assistant. I can help explain difficult concepts, summarize your notes, or generate study plans. What would you like to learn today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user" as const, text: userMessage }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.filter(m => m.id !== "1"); // exclude initial greeting
      const res = await api.post("/api/ai/chat", { message: userMessage, history });
      
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "model", text: res.data.text }
      ]);
    } catch (error) {
      toast.error("Failed to get response from AI");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { id: "1", role: "model", text: "Chat history cleared. What would you like to study?" }
    ]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">AI Study Assistant</h2>
            <p className="text-sm font-medium text-slate-500">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-transparent"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
              msg.role === "user" ? "bg-blue-600" : "bg-slate-800"
            }`}>
              {msg.role === "user" ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
            </div>
            <div className={`group relative max-w-[80%] rounded-2xl px-5 py-3 shadow-sm border ${
              msg.role === "user" 
                ? "bg-blue-600 text-white border-transparent" 
                : "bg-white border-slate-200 text-slate-800"
            }`}>
              <div className="markdown-body text-sm prose max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              
              {msg.role === "model" && (
                <button
                  onClick={() => handleCopy(msg.text)}
                  className="absolute -right-12 top-2 hidden rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 group-hover:block transition-colors"
                  title="Copy response"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm bg-slate-800">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-4 bg-white rounded-b-xl">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-4 pr-12 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
