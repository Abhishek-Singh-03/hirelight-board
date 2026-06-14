import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Search, User, MapPin, Briefcase, Mail, FileText, PlusCircle,
  X, Loader2, Building2, DollarSign, LinkIcon, Tag, LayoutGrid, List
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";

interface Candidate {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  bio: string;
  matchScore: number;
}

interface PostedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
}

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"talent" | "post" | "myjobs">("talent");

  // --- Talent Discovery State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // --- Post Job State ---
  const [posting, setPosting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "", company: user?.name ? `${user.name}'s Company` : "",
    location: "Remote", salary: "", applyLink: "", category: "tech",
    description: "", type: "full-time"
  });

  // --- My Posted Jobs ---
  const [myJobs, setMyJobs] = useState<PostedJob[]>([]);
  const [loadingMyJobs, setLoadingMyJobs] = useState(false);

  useEffect(() => {
    // Fetch all candidates
    setLoadingCandidates(true);
    fetch(`${API_BASE_URL}/talent`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((u: any) => {
          let parsedSkills: string[] = [];
          try {
            const parsed = JSON.parse(u.skills);
            parsedSkills = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            parsedSkills = [];
          }
          if (parsedSkills.length === 0) parsedSkills = ["Java", "React", "SQL"];
          return {
            id: u.id, name: u.name,
            role: "Software Engineer",
            location: "Remote",
            experience: "Mid-Level",
            skills: parsedSkills,
            bio: u.bio || "No bio provided.",
            matchScore: Math.floor(Math.random() * 30) + 70,
          };
        });
        setCandidates(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingCandidates(false));
  }, []);

  const fetchMyJobs = () => {
    if (!user) return;
    setLoadingMyJobs(true);
    const auth = JSON.parse(localStorage.getItem("hl_auth") || "{}");
    fetch(`${API_BASE_URL}/jobs/mine`, {
      headers: { "Authorization": `Bearer ${auth.token}` }
    })
      .then(res => res.json())
      .then(data => setMyJobs(data))
      .catch(() => toast({ title: "Error", description: "Could not load your jobs.", variant: "destructive" }))
      .finally(() => setLoadingMyJobs(false));
  };

  useEffect(() => {
    if (activeTab === "myjobs") fetchMyJobs();
  }, [activeTab]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) {
      toast({ title: "Missing fields", description: "Title and Company are required.", variant: "destructive" });
      return;
    }
    setPosting(true);
    const auth = JSON.parse(localStorage.getItem("hl_auth") || "{}");
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${auth.token}` },
        body: JSON.stringify(jobForm)
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Job Posted! 🎉", description: `${jobForm.title} at ${jobForm.company} is now live.` });
      setJobForm({ title: "", company: "", location: "Remote", salary: "", applyLink: "", category: "tech", description: "", type: "full-time" });
      setActiveTab("myjobs");
    } catch {
      toast({ title: "Error", description: "Could not post job. Try again.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm={""} onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="container mx-auto px-4 py-10 flex-1">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Recruiter Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, <strong className="text-foreground">{user?.name}</strong>. Discover talent and manage your job listings.
            </p>
          </div>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setActiveTab("post")}>
            <PlusCircle className="h-4 w-4" /> Post a New Job
          </Button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-8 bg-secondary/20 p-1 rounded-xl border border-border w-fit">
          {([
            { key: "talent", label: "Find Talent 🔍" },
            { key: "post", label: "Post a Job +" },
            { key: "myjobs", label: "My Listings 📋" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== TAB: TALENT ===================== */}
        {activeTab === "talent" && (
          <div>
            <div className="max-w-2xl mb-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or skill (e.g. React)..."
                className="pl-12 h-12 text-base rounded-xl border-primary/20 focus-visible:ring-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {loadingCandidates ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No candidates found. Try a different search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map(c => (
                  <Card key={c.id} className="relative overflow-hidden glass hover:-translate-y-1 transition-transform duration-300 border border-border">
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
                    <CardContent className="p-6 space-y-4 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base leading-tight">{c.name}</h3>
                            <p className="text-primary text-xs font-medium">{c.role}</p>
                          </div>
                        </div>
                        {c.matchScore > 85 && (
                          <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-xs shrink-0">
                            Top Match 🔥
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground gap-3">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {c.experience}</span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{c.bio}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 4).map(s => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5">{s}</Badge>
                        ))}
                        {c.skills.length > 4 && <Badge variant="outline" className="text-[10px]">+{c.skills.length - 4}</Badge>}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 text-xs gap-1.5 shadow-md shadow-primary/20" onClick={() => toast({ title: "Message Request Sent!", description: `We'll notify ${c.name} that you want to connect.` })}>
                          <Mail className="h-3.5 w-3.5" /> Contact
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs hover:bg-secondary/20">
                          <FileText className="h-3.5 w-3.5" /> Resume
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: POST JOB ===================== */}
        {activeTab === "post" && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary/20 glass shadow-[0_0_40px_-15px_hsl(var(--primary)/0.3)]">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <PlusCircle className="h-5 w-5 text-primary" /> Post a New Job Listing
                </CardTitle>
                <p className="text-sm text-muted-foreground">This will appear publicly on the HireLight jobs board.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePostJob} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Job Title *</label>
                      <Input placeholder="e.g. Senior React Developer" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} required className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Company *</label>
                      <Input placeholder="e.g. Google" value={jobForm.company} onChange={e => setJobForm(p => ({ ...p, company: e.target.value }))} required className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location</label>
                      <Input placeholder="e.g. Bangalore / Remote" value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Salary / CTC</label>
                      <Input placeholder="e.g. 15-20 LPA" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-muted-foreground" /> Category</label>
                      <select value={jobForm.category} onChange={e => setJobForm(p => ({ ...p, category: e.target.value }))} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                        <option value="tech">Tech</option>
                        <option value="fresher">Fresher</option>
                        <option value="remote">Remote</option>
                        <option value="government">Government</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5 text-muted-foreground" /> Apply Link</label>
                      <Input placeholder="https://careers.company.com/job" value={jobForm.applyLink} onChange={e => setJobForm(p => ({ ...p, applyLink: e.target.value }))} className="rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Job Description</label>
                    <Textarea
                      placeholder="Describe the role, responsibilities, required skills, and anything else that will help candidates decide..."
                      className="h-36 resize-none rounded-xl focus-visible:ring-primary"
                      value={jobForm.description}
                      onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setJobForm({ title: "", company: "", location: "Remote", salary: "", applyLink: "", category: "tech", description: "", type: "full-time" })}>
                      <X className="h-4 w-4 mr-2" /> Clear
                    </Button>
                    <Button type="submit" disabled={posting} className="w-full font-bold shadow-lg shadow-primary/20">
                      {posting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...</> : "Publish Job →"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== TAB: MY JOBS ===================== */}
        {activeTab === "myjobs" && (
          <div>
            {loadingMyJobs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : myJobs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl space-y-4">
                <div className="text-5xl">📋</div>
                <h3 className="text-xl font-semibold">You haven't posted any jobs yet.</h3>
                <p className="text-muted-foreground">Your published listings will appear here.</p>
                <Button onClick={() => setActiveTab("post")} className="gap-2 mt-2">
                  <PlusCircle className="h-4 w-4" /> Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{myJobs.length} active listing{myJobs.length > 1 ? "s" : ""}</p>
                {myJobs.map(job => (
                  <Card key={job.id} className="border border-border/60 glass hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-base">{job.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                          {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="border-green-500/40 text-green-500 text-xs">Live</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
