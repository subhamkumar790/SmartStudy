import { useState, useContext } from "react";
import { User, Mail, Lock, AlertTriangle, Save, Trash2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, login, logout } = useContext(AuthContext);
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/api/auth/profile", { name, email, password: password || undefined });
      login({ ...user, ...res.data });
      setPassword("");
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.")) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await api.delete("/api/auth/account");
      localStorage.removeItem("token");
      logout();
      toast.success("Account deleted");
    } catch (error: any) {
      toast.error("Failed to delete account");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
          <p className="text-sm text-slate-500">Update your account's profile information and email address.</p>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span></label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden mt-8">
        <div className="border-b border-red-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain. All of your notes, exams, tasks, and data will be permanently wiped.
          </p>
          <button
            onClick={handleDeleteAccount} disabled={deleteLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
