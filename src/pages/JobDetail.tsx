import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Building2, Calendar, DollarSign, Briefcase, ExternalLink, ArrowLeft, Share2, Bookmark, FileText, Clock, BookOpen, Globe } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { Job } from "@/components/JobCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const unescapeHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '');
};

const decodeHtml = (text: string): string => {
  if (!text) return '';
  return unescapeHtml(text)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ').trim();
};

const setMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    const attr = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Try router state first (passed from JobCard click) — instant, no API call needed
  const stateJob = (location.state as { job?: Job } | null)?.job;

  const [job, setJob] = useState<Job | null>(stateJob || null);
  const [loading, setLoading] = useState(!stateJob);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  // Apply SEO tags whenever job changes
  useEffect(() => {
    if (!job) return;
    const title = `${job.title} at ${job.company} | GoJobWise`;
    const desc = decodeHtml(job.description || '').substring(0, 160) || `${job.title} at ${job.company} — ${job.location}`;
    document.title = title;
    setMeta("description", desc);
    setMeta("og:title", title);
    setMeta("og:description", desc);
    setMeta("og:url", window.location.href);
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
  }, [job]);

  // Cleanup on unmount
  useEffect(() => {
    document.title = "GoJobWise — Find Your Next Tech Job";
    return () => { document.title = "GoJobWise — Find Your Next Tech Job"; };
  }, []);

  useEffect(() => {
    // If we already have the job from router state, skip fetching
    if (stateJob || !id) return;

    setLoading(true);

    // Strategy 1: Try the dedicated /jobs/{id}/detail endpoint (needs new backend build)
    fetch(`${API_BASE_URL}/jobs/${id}/detail`)
      .then(res => {
        if (res.ok) return res.json();
        // Strategy 2: Fallback — fetch all jobs and find by ID
        return fetch(`${API_BASE_URL}/jobs`)
          .then(r => r.json())
          .then((jobs: Job[]) => {
            const found = jobs.find(j => String(j.id) === String(id));
            if (!found) throw new Error("not found");
            return found;
          });
      })
      .then(data => {
        if (!data) { setNotFound(true); return; }
        setJob(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, stateJob]);

  const handleTrack = async () => {
    if (!isAuthenticated) { navigate("/auth?mode=login"); return; }
    if (!job) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}/stage?status=SAVED`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error();
      // Also save to localStorage for the dashboard
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (!saved.find((s: Job) => s.id === job.id)) {
        saved.push(job);
        localStorage.setItem('savedJobs', JSON.stringify(saved));
      }
      toast({ title: "Job Saved! 📌", description: "Added to your tracker board." });
    } catch {
      toast({ title: "Error", description: "Could not save. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied! 🔗", description: "Share this job with your friends." });
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  const generateCoverLetter = () => {
    if (!job) return;
    const text = `Dear Hiring Manager at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} position.\n\n"${decodeHtml(job.description || '').substring(0, 200).trim()}..."\n\nI would welcome the opportunity to discuss how my skills align with your needs.\n\nBest regards,\n[Your Name Here]`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${(job.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Cover Letter Ready!", description: "Downloaded to your device." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-7xl">🔍</div>
            <h1 className="text-3xl font-bold">Job Not Found</h1>
            <p className="text-muted-foreground">This job posting may have been removed or expired.</p>
            <Button onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Browse All Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = (() => {
    try { return formatDistanceToNow(new Date(job.postedOn), { addSuffix: true }); }
    catch { return "Recently posted"; }
  })();

  const categoryColors: Record<string, string> = {
    remote: "bg-green-500/10 text-green-400 border-green-500/30",
    fresher: "bg-primary/10 text-primary border-primary/30",
    government: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    tech: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    internship: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    design: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  };
  const catClass = categoryColors[job.category?.toLowerCase() || ''] || "bg-muted text-muted-foreground border-border";

  const renderDescription = () => {
    if (!job.description) return null;
    
    const unescaped = unescapeHtml(job.description);
    
    // Check if the description contains HTML tags (e.g. from Greenhouse sync)
    const hasHTML = /<[a-z][\s\S]*>/i.test(unescaped);
    
    if (hasHTML) {
      return (
        <div 
          className="job-description-content prose prose-invert prose-p:leading-relaxed prose-li:my-1 prose-headings:text-foreground prose-a:text-primary max-w-none"
          dangerouslySetInnerHTML={{ __html: unescaped }} 
        />
      );
    }

    // Otherwise treat as Markdown
    return (
      <div className="prose prose-invert prose-p:leading-relaxed prose-li:my-1 prose-headings:text-foreground prose-a:text-primary max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {unescaped}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{job.title}</span>
        </div>

        {/* Hero Card */}
        <Card className="border-2 border-primary/20 bg-background/50 backdrop-blur glass shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)] mb-8 overflow-hidden relative">
          {/* Glow decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              {/* Left: Job info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {job.category && (
                    <Badge className={`border ${catClass} text-xs capitalize`}>{job.category}</Badge>
                  )}
                  {job.type && (
                    <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary/60" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/60" /> {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-primary/60" /> {job.salary}
                    </span>
                  )}
                  {job.experienceRequired && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary/60" /> {job.experienceRequired}
                    </span>
                  )}
                  {job.educationRequired && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary/60" /> {job.educationRequired}
                    </span>
                  )}
                  {job.workMode && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary/60" /> {job.workMode}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary/60" /> {formattedDate}
                  </span>
                  {job.lastDateToApply && (
                    <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                      <Calendar className="h-4 w-4" /> Apply By: {job.lastDateToApply}
                    </span>
                  )}
                </div>

                {job.skills && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.skills.split(',').map(s => s.trim()).filter(s => s).map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-primary/5 text-primary/80 hover:bg-primary/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Company logo placeholder */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                <Briefcase className="h-8 w-8 text-primary/50" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Button
                onClick={() => window.open(job.applyLink, "_blank")}
                className="gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8"
                size="lg"
              >
                <ExternalLink className="h-4 w-4" /> Apply Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
                onClick={handleTrack}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
                {saving ? "Saving..." : "Track Job"}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={generateCoverLetter}
              >
                <FileText className="h-4 w-4" /> Cover Letter
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground ml-auto"
                onClick={handleShare}
                title="Copy shareable link"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        {job.description && (
          <Card className="border border-border/50 bg-background/40 glass">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                About This Role
              </h2>
              <div className="prose prose-invert prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground max-w-none">
                {renderDescription()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <div>
            <p className="font-semibold text-foreground">Ready to apply?</p>
            <p className="text-sm text-muted-foreground">Don't miss this opportunity at {job.company}.</p>
          </div>
          <Button
            onClick={() => window.open(job.applyLink, "_blank")}
            className="gap-2 font-bold shadow-lg shadow-primary/20"
          >
            <ExternalLink className="h-4 w-4" /> Apply on Company Site
          </Button>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to job listings
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
