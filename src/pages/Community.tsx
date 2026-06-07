import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Calendar, Building2, PenLine, EyeOff, Eye, X, CheckCircle2, AlertCircle, Share2, Copy } from "lucide-react";

export interface ExperiencePost {
  id: string;
  jobTitle: string;
  company: string;
  author: string;
  text: string;
  date: string;
  upvotes: number;
  type: 'offer' | 'interview' | 'rejection';
  shareCode?: string;
}

const API = "http://localhost:8080";

export default function Community() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<ExperiencePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ExperiencePost | null>(null);

  // ── Share form state ───────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    jobTitle: "", company: "", type: "offer" as "offer" | "interview" | "rejection", text: ""
  });
  
  // Track upvoted posts to prevent multiple upvotes
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("hl_upvoted");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/community`)
      .then(res => res.json())
      .then((data: ExperiencePost[]) => {
        setPosts(data);
        
        // Auto-open post if someone clicked a shortcode shared link
        if (shareCode) {
          const postToOpen = data.find(p => p.shareCode === shareCode);
          if (postToOpen) {
            setSelectedPost(postToOpen);
          }
        }
      })
      .catch(err => console.error("Failed to load community experiences", err));
  }, [shareCode]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (upvotedPosts.has(id)) {
      showToast('error', "You've already found this helpful!");
      return;
    }

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
    if (selectedPost?.id === id) {
      setSelectedPost(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    }
    
    // Save to local storage
    const newUpvoted = new Set(upvotedPosts).add(id);
    setUpvotedPosts(newUpvoted);
    localStorage.setItem("hl_upvoted", JSON.stringify([...newUpvoted]));

    // Send to backend
    fetch(`${API}/community/${id}/upvote`, { method: "POST" })
      .catch(err => console.error("Upvote failed", err));
  };

  const handleShare = (post: ExperiencePost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Use the short shareCode if available, fallback to id if not
    const code = post.shareCode || post.id;
    const postUrl = `${window.location.origin}/community/${code}`;
    const textToShare = `Read this interview experience for ${post.jobTitle} at ${post.company}:\n\n${postUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${post.company} Interview Experience`,
        text: `${post.jobTitle} at ${post.company}`,
        url: postUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(textToShare);
      showToast('success', 'Post link copied to clipboard!');
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      showToast('error', 'Please log in to share your experience.');
      return;
    }
    if (!form.jobTitle.trim() || !form.company.trim() || !form.text.trim()) {
      showToast('error', 'Please fill in all fields before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/community`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, anonymous: isAnonymous })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Something went wrong.');
      } else {
        showToast('success', 'Your experience was posted! Thank you for helping the community. 🎉');
        setForm({ jobTitle: "", company: "", type: "offer", text: "" });
        setIsAnonymous(false);
        setShowForm(false);
        // Refresh posts
        fetch(`${API}/community`).then(r => r.json()).then(setPosts);
      }
    } catch {
      showToast('error', 'Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = posts.filter(p =>
    p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearchSubmit={() => {}} />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-fade-in
          ${toast.type === 'success'
            ? 'bg-green-500/20 border-green-500/40 text-green-400'
            : 'bg-destructive/20 border-destructive/40 text-destructive'
          }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="h-5 w-5 shrink-0" />
            : <AlertCircle className="h-5 w-5 shrink-0" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <main className="container mx-auto px-4 py-12 flex-1 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <MessageSquare className="h-4 w-4" />
            Interview Intel
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Developer Community
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real interview timelines, salary numbers, and experiences from developers who got the offer. No fluff, just facts.
          </p>
          <Button
            className="mt-4 gap-2 rounded-2xl px-6"
            onClick={() => setShowForm(v => !v)}
            id="share-experience-btn"
          >
            <PenLine className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Share Your Experience'}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Share Form ───────────────────────────────────────────────── */}
          {showForm && (
            <Card className="border-2 border-primary/30 glass shadow-[0_0_30px_-10px_var(--primary)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-primary" /> Share Your Interview Experience
                </CardTitle>
                <p className="text-sm text-muted-foreground">Help other developers — share your real story.</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job Title</label>
                    <Input
                      id="exp-job-title"
                      placeholder="e.g. SDE 2, Backend Engineer"
                      value={form.jobTitle}
                      onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</label>
                    <Input
                      id="exp-company"
                      placeholder="e.g. Groww, Razorpay"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outcome</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['offer', 'interview', 'rejection'] as const).map(t => (
                      <button
                        key={t}
                        id={`exp-type-${t}`}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.type === t
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background/40 border-border hover:border-primary/50'
                        }`}
                      >
                        {t === 'offer' ? '🎉 Got Offer' : t === 'interview' ? '⏳ In Process' : '❌ Rejected'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Your Experience <span className="text-muted-foreground/60 normal-case font-normal">(min 50 chars)</span>
                  </label>
                  <Textarea
                    id="exp-text"
                    placeholder="Walk us through your interview process — rounds, topics asked, salary offered, tips for others..."
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    className="rounded-xl min-h-[140px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground text-right">{form.text.length} / 5000</p>
                </div>

                {/* Anonymous toggle */}
                <div
                  id="exp-anonymous-toggle"
                  onClick={() => setIsAnonymous(v => !v)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all select-none ${
                    isAnonymous
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-background/30 border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${
                    isAnonymous ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground'
                  }`}>
                    {isAnonymous ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {isAnonymous ? 'Posting Anonymously' : 'Post with your name'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAnonymous
                        ? 'Your name will NOT be shown. Only "Anonymous" will appear.'
                        : 'Your display name will be visible to everyone. Click to hide it.'}
                    </p>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 ${
                    isAnonymous ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}>
                    <div className="h-4 w-4 rounded-full bg-white shadow" />
                  </div>
                </div>

                {!token && (
                  <p className="text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                    ⚠️ You must be logged in to post. Your name will show based on your account.
                  </p>
                )}

                <Button
                  id="exp-submit-btn"
                  className="w-full rounded-2xl h-12 font-semibold text-base"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : `Post ${isAnonymous ? 'Anonymously' : 'Experience'}`}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Post Cards ───────────────────────────────────────────────── */}
          {filtered.map(post => (
            <Card
              key={post.id}
              className="border-2 border-primary/10 glass glass-hover transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      {post.jobTitle} at {post.company}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        {post.author === 'Anonymous'
                          ? <><EyeOff className="h-3 w-3" /> Anonymous</>
                          : <>By: {post.author}</>
                        }
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    </div>
                  </div>
                  <Badge variant={post.type === 'offer' ? 'default' : 'secondary'}
                    className={post.type === 'offer' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                    {post.type === 'offer' ? '🎉 Received Offer' : post.type === 'rejection' ? '❌ Rejected' : '⏳ In Process'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-background/40 p-4 rounded-xl border border-border/50 text-sm md:text-base leading-relaxed line-clamp-3">
                  {post.text}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`gap-2 transition-colors ${upvotedPosts.has(post.id) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                    onClick={(e) => handleUpvote(post.id, e)}
                  >
                    <ThumbsUp className="h-4 w-4" /> {post.upvotes} Helpful
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={(e) => handleShare(post, e)}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-background/30 rounded-2xl border border-dashed border-border/50">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No experiences found</h3>
              <p className="text-muted-foreground">Be the first to share an experience for this search!</p>
            </div>
          )}
        </div>

        {/* ── Full Post Modal ──────────────────────────────────────────────── */}
        {selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
            onClick={() => {
              setSelectedPost(null);
              // Clean the URL if we close the deep-linked post
              if (shareCode) navigate("/community", { replace: true });
            }}
          >
            <Card
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto border-2 border-primary/30 shadow-[0_0_40px_-10px_var(--primary)] glass"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-border/50 bg-background/50 sticky top-0 backdrop-blur pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-primary" />
                      {selectedPost.jobTitle} at {selectedPost.company}
                    </CardTitle>
                    <div className="text-muted-foreground mt-3 flex items-center gap-6">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {selectedPost.author === 'Anonymous'
                          ? <><EyeOff className="h-4 w-4" /> Anonymous</>
                          : <>By: {selectedPost.author}</>}
                      </span>
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {selectedPost.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" 
                    onClick={() => {
                      setSelectedPost(null);
                      if (shareCode) navigate("/community", { replace: true });
                    }}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive">✕</Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Badge variant={selectedPost.type === 'offer' ? 'default' : 'secondary'}
                  className={`mb-6 text-sm px-4 py-1.5 ${selectedPost.type === 'offer' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}`}>
                  {selectedPost.type === 'offer' ? '🎉 Received Offer' : selectedPost.type === 'rejection' ? '❌ Rejected' : '⏳ In Process'}
                </Badge>

                <div className="prose prose-invert max-w-none">
                  {selectedPost.text.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? (
                      <p key={idx} className="text-base md:text-lg leading-relaxed text-foreground/90 mb-4 tracking-wide font-medium">
                        {paragraph}
                      </p>
                    ) : <br key={idx} />
                  ))}
                </div>

                <div className="mt-12 pt-6 border-t border-border/50 flex justify-between items-center bg-background/30 p-4 rounded-xl">
                  <span className="text-muted-foreground font-medium">Was this experience helpful?</span>
                  <div className="flex gap-2">
                    <Button variant="outline"
                      className={`gap-2 transition-all ${upvotedPosts.has(selectedPost.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-primary/10 hover:bg-primary/20 hover:text-primary border-primary/20'}`}
                      onClick={() => handleUpvote(selectedPost.id)}>
                      <ThumbsUp className="h-4 w-4" /> {upvotedPosts.has(selectedPost.id) ? 'Helpful' : 'Upvote'} ({selectedPost.upvotes})
                    </Button>
                    <Button variant="outline"
                      className="gap-2 bg-muted/40 hover:bg-muted border-border transition-all"
                      onClick={() => handleShare(selectedPost)}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
