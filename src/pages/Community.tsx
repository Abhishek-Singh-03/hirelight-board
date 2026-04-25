import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Calendar, Building2 } from "lucide-react";

export interface ExperiencePost {
  id: string;
  jobTitle: string;
  company: string;
  author: string;
  text: string;
  date: string;
  upvotes: number;
  type: 'offer' | 'interview' | 'rejection';
}

const DUMMY_EXPERIENCES: ExperiencePost[] = [
  {
    id: "1", jobTitle: "SDE 2", company: "Google", author: "Anonymous",
    text: "Round 1 was purely DSA (Graphs & DP). Round 2 focused on System Design (URL Shortener). Honestly, the behavioural round was the hardest. Tip: Use STAR method!",
    date: "2 days ago", upvotes: 34, type: "offer"
  },
  {
    id: "2", jobTitle: "Frontend Engineer", company: "Stripe", author: "DevMaster99",
    text: "They gave me a buggy React app and told me to debug it live. Deep knowledge of useEffect and closure traps was absolutely critical here.",
    date: "1 week ago", upvotes: 112, type: "interview"
  }
];

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<ExperiencePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ExperiencePost | null>(null);

  useEffect(() => {
    // Merge dummy with localStorage
    const local = JSON.parse(localStorage.getItem('experiences') || '[]');
    setPosts([...local, ...DUMMY_EXPERIENCES]);
  }, []);

  const handleUpvote = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const filtered = posts.filter(p => 
    p.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[72px]">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearchSubmit={() => {}} />

      <main className="container mx-auto px-4 py-12 flex-1 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <MessageSquare className="h-4 w-4" />
            Interview Intel
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Developer Community
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Read real interview timelines, cheat codes, and experiences from developers who got the offer. No fluff, just facts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
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
                      <span>By: {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    </div>
                  </div>
                  <Badge variant={post.type === 'offer' ? 'default' : 'secondary'} className={post.type === 'offer' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                    {post.type === 'offer' ? '🎉 Received Offer' : '⏳ In Process'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-background/40 p-4 rounded-xl border border-border/50 text-sm md:text-base leading-relaxed line-clamp-3">
                  {post.text}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary transition-colors" onClick={() => handleUpvote(post.id)}>
                    <ThumbsUp className="h-4 w-4" /> {post.upvotes} Helpful
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

        {/* FULL BLOG READER MODAL */}
        {selectedPost && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedPost(null)}
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
                      <span className="font-semibold text-foreground">By: {selectedPost.author}</span>
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {selectedPost.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                     ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Badge variant={selectedPost.type === 'offer' ? 'default' : 'secondary'} className={`mb-6 text-sm px-4 py-1.5 ${selectedPost.type === 'offer' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}`}>
                  {selectedPost.type === 'offer' ? '🎉 Received Offer' : '⏳ In Process'}
                </Badge>

                <div className="prose prose-invert max-w-none">
                  {selectedPost.text.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-base md:text-lg leading-relaxed text-foreground/90 mb-4 tracking-wide font-medium">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-12 pt-6 border-t border-border/50 flex justify-between items-center bg-background/30 p-4 rounded-xl">
                  <span className="text-muted-foreground font-medium">Was this experience helpful?</span>
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-primary/10 hover:bg-primary/20 hover:text-primary transition-all border-primary/20" 
                    onClick={() => handleUpvote(selectedPost.id)}
                  >
                    <ThumbsUp className="h-4 w-4" /> Upvote ({selectedPost.upvotes})
                  </Button>
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
