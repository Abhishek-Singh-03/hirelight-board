import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  PlusCircle, X, Loader2, Building2, DollarSign, LinkIcon,
  Tag, MapPin, Briefcase, Eye, RefreshCw, Lock, Mail,
  Trash2, Pencil, Check, BarChart3, Users, FileText, Package, Download
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PostedJob {
  id: string; title: string; company: string;
  location: string; salary: string; type: string;
  category: string; postedOn: string; description: string;
  applyLink: string;
}

interface Stats {
  totalJobs: number; totalCandidates: number;
  totalExperiences: number; myJobsCount: number;
  jobsByCategory: { category: string; cnt: number }[];
}

const emptyForm = {
  title: "", company: "HireLight", location: "Remote",
  salary: "", applyLink: "", category: "tech", description: "", type: "full-time"
};

const API = API_BASE_URL;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [token, setToken] = useState("");
  const [adminName, setAdminName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"stats" | "post" | "jobs">("stats");
  const [posting, setPosting] = useState(false);
  const [jobForm, setJobForm] = useState(emptyForm);
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PostedJob>>({});

  // ── Auth helpers ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    const n = sessionStorage.getItem("admin_name");
    if (t && n) { setToken(t); setAdminName(n); }
  }, []);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const handleSyncJobs = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/jobs/sync`, {
        method: "POST",
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sync failed");
      toast({
        title: `✅ Sync Complete!`,
        description: `${data.inserted} new jobs added, ${data.skipped} already existed.`
      });
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Login failed", description: data.error, variant: "destructive" }); return; }
      if (data.role !== "RECRUITER") { toast({ title: "Access denied", description: "Admin accounts only.", variant: "destructive" }); return; }
      setToken(data.token);
      setAdminName(data.name);
      sessionStorage.setItem("admin_token", data.token);
      sessionStorage.setItem("admin_name", data.name);
      toast({ title: `Welcome, ${data.name}! ✅` });
    } catch {
      toast({ title: "Connection error", description: "Backend not reachable.", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_name");
    setToken(""); setAdminName("");
  };

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/jobs/stats`, { headers: authHeaders() });
      setStats(await res.json());
    } finally { setLoadingStats(false); }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(`${API}/jobs/mine`, { headers: authHeaders() });
      setJobs(await res.json());
    } finally { setLoadingJobs(false); }
  };

  useEffect(() => {
    if (!token) return;
    if (activeTab === "stats") fetchStats();
    if (activeTab === "jobs") fetchJobs();
  }, [activeTab, token]);

  // ── Post Job ─────────────────────────────────────────────────────────────────

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) {
      toast({ title: "Title and Company required.", variant: "destructive" }); return;
    }
    setPosting(true);
    try {
      const res = await fetch(`${API}/jobs/post`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(jobForm)
      });
      if (!res.ok) throw new Error();
      toast({ title: "Job Published! 🎉", description: `"${jobForm.title}" is now live.` });
      setJobForm(emptyForm);
      setActiveTab("jobs");
    } catch {
      toast({ title: "Error posting job.", variant: "destructive" });
    } finally { setPosting(false); }
  };

  // ── Delete Job ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/jobs/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast({ title: "Job deleted." });
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch {
      toast({ title: "Delete failed.", variant: "destructive" });
    }
  };

  // ── Update Job ────────────────────────────────────────────────────────────────

  const startEdit = (job: PostedJob) => {
    setEditingId(job.id);
    setEditForm({ ...job });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`${API}/jobs/${id}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error();
      toast({ title: "Job updated! ✅" });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...editForm as PostedJob } : j));
      cancelEdit();
    } catch {
      toast({ title: "Update failed.", variant: "destructive" });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border border-zinc-800 bg-zinc-900 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-white text-xl">Admin Panel</CardTitle>
            <p className="text-zinc-500 text-sm mt-1">Sign in with your Recruiter account</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </label>
                <Input type="email" placeholder="admin@hirelight.com" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <Input type="password" placeholder="••••••••" value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-primary" />
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full font-bold mt-2">
                {loginLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : "Enter Admin Panel →"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN PANEL
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Top Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-none">HireLight Admin</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Logged in as <span className="text-zinc-300 font-medium">{adminName}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">Live</Badge>
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 text-xs" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Tab Bar + Sync Button */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {([
              { key: "stats", label: "📊 Stats" },
              { key: "post",  label: "+ Post Job" },
              { key: "jobs",  label: `📋 My Listings (${jobs.length})` },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-primary text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sync Jobs from Greenhouse & Lever */}
          <Button
            onClick={handleSyncJobs}
            disabled={syncing}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30 border border-emerald-500/30"
          >
            {syncing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing Jobs...</>
              : <><Download className="h-4 w-4" /> Sync Real Jobs</>}
          </Button>
        </div>

        {/* ═══ STATS TAB ═══════════════════════════════════════════════════════ */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : stats && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "My Listings", value: stats.myJobsCount, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                    { label: "Candidates", value: stats.totalCandidates, icon: Users, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                    { label: "Community Posts", value: stats.totalExperiences, icon: FileText, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className={`border ${bg} bg-zinc-900`}>
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center shrink-0`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white">{value}</p>
                          <p className="text-xs text-zinc-500 font-medium">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Jobs by Category */}
                {stats.jobsByCategory?.length > 0 && (
                  <Card className="border border-zinc-800 bg-zinc-900">
                    <CardHeader className="border-b border-zinc-800 pb-4">
                      <CardTitle className="text-white flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4 text-primary" /> Jobs by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      {stats.jobsByCategory.map(({ category, cnt }) => {
                        const pct = Math.round((cnt / stats.totalJobs) * 100);
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-300 capitalize font-medium">{category}</span>
                              <span className="text-zinc-500">{cnt} jobs ({pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                <Button variant="ghost" size="sm" className="text-zinc-500 gap-1.5" onClick={fetchStats}>
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Stats
                </Button>
              </>
            )}
          </div>
        )}

        {/* ═══ POST JOB TAB ════════════════════════════════════════════════════ */}
        {activeTab === "post" && (
          <Card className="border border-zinc-800 bg-zinc-900 shadow-xl max-w-2xl mx-auto">
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <PlusCircle className="h-5 w-5 text-primary" /> Post New Job
              </CardTitle>
              <p className="text-zinc-500 text-sm">Appears immediately on the public jobs board.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "title",    label: "Job Title *",   placeholder: "Senior React Developer", icon: Briefcase },
                    { key: "company",  label: "Company *",     placeholder: "Google",                 icon: Building2 },
                    { key: "location", label: "Location",      placeholder: "Bangalore / Remote",     icon: MapPin },
                    { key: "salary",   label: "Salary / CTC",  placeholder: "15-20 LPA",              icon: DollarSign },
                    { key: "applyLink",label: "Apply Link",    placeholder: "https://...",            icon: LinkIcon },
                  ].map(({ key, label, placeholder, icon: Icon }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon className="h-3 w-3" /> {label}
                      </label>
                      <Input placeholder={placeholder} value={(jobForm as any)[key]}
                        onChange={e => setJobForm(p => ({ ...p, [key]: e.target.value }))}
                        required={key === "title" || key === "company"}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg focus-visible:ring-primary" />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="h-3 w-3" /> Category
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["tech","fresher","remote","government","internship","finance","design"].map(c => {
                        const selectedCats = (jobForm.category || "tech").split(",").map((s: string) => s.trim());
                        const isSelected = selectedCats.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              let newCats = [...selectedCats];
                              if (isSelected) {
                                newCats = newCats.filter(x => x !== c);
                              } else {
                                newCats.push(c);
                              }
                              if (newCats.length === 0) newCats.push("tech"); // Prevent empty
                              setJobForm(p => ({ ...p, category: newCats.join(", ") }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isSelected ? "bg-primary text-white border-primary shadow-sm" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}
                          >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                  <Textarea placeholder="Role responsibilities, required skills, perks..."
                    className="h-36 resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg focus-visible:ring-primary"
                    value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    onClick={() => setJobForm(emptyForm)}>
                    <X className="h-4 w-4 mr-2" /> Clear
                  </Button>
                  <Button type="submit" disabled={posting} className="flex-1 font-bold shadow-lg shadow-primary/20">
                    {posting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</> : "Publish Job →"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ═══ MY LISTINGS TAB ════════════════════════════════════════════════ */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-zinc-400 text-sm">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
              <Button variant="ghost" size="sm" className="text-zinc-500 gap-1.5" onClick={fetchJobs}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>

            {loadingJobs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 space-y-3">
                <div className="text-4xl">📭</div>
                <p className="font-medium">No jobs posted yet.</p>
                <Button size="sm" className="gap-2 mt-2" onClick={() => setActiveTab("post")}>
                  <PlusCircle className="h-4 w-4" /> Post First Job
                </Button>
              </div>
            ) : (
              jobs.map(job => (
                <Card key={job.id} className="border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-5">
                    {editingId === job.id ? (
                      /* ── EDIT MODE ── */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { k: "title", ph: "Job Title" }, { k: "company", ph: "Company" },
                            { k: "location", ph: "Location" }, { k: "salary", ph: "Salary" },
                            { k: "applyLink", ph: "Apply Link" },
                          ].map(({ k, ph }) => (
                            <Input key={k} placeholder={ph} value={(editForm as any)[k] || ""}
                              onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                              className="bg-zinc-800 border-zinc-700 text-white text-sm h-9 rounded-lg focus-visible:ring-primary" />
                          ))}
                          <div className="flex flex-wrap gap-1.5 col-span-2">
                            {["tech","fresher","remote","government","internship","finance","design"].map(c => {
                              const selectedCats = (editForm.category || "tech").split(",").map((s: string) => s.trim());
                              const isSelected = selectedCats.includes(c);
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => {
                                    let newCats = [...selectedCats];
                                    if (isSelected) {
                                      newCats = newCats.filter(x => x !== c);
                                    } else {
                                      newCats.push(c);
                                    }
                                    if (newCats.length === 0) newCats.push("tech");
                                    setEditForm(p => ({ ...p, category: newCats.join(", ") }));
                                  }}
                                  className={`px-2 py-1 rounded text-xs transition-all border ${isSelected ? "bg-primary/20 text-primary border-primary/50" : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}
                                >
                                  {c}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <Textarea placeholder="Description" value={editForm.description || ""}
                          onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          className="h-24 resize-none bg-zinc-800 border-zinc-700 text-white text-sm rounded-lg focus-visible:ring-primary" />
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-1.5 font-semibold" onClick={() => saveEdit(job.id)}>
                            <Check className="h-3.5 w-3.5" /> Save Changes
                          </Button>
                          <Button size="sm" variant="ghost" className="text-zinc-500" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-white">{job.title}</h3>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">Live</Badge>
                            <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-[10px] capitalize">{job.category}</Badge>
                          </div>
                          <p className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                            {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</span>}
                            <span className="text-zinc-600 text-xs">{job.postedOn}</span>
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
                            title="Edit" onClick={() => startEdit(job)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete" onClick={() => handleDelete(job.id, job.title)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
                            title="View on site" onClick={() => window.open("/", "_blank")}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
