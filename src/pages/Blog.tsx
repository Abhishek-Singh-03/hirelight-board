import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { usePageSEO } from "@/lib/seo";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  authorName: string;
  createdAt: string;
}

function readingTime(excerpt: string) {
  const words = (excerpt || "").split(" ").length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: "Career Blog — Interview Tips, Resume Guides & Job Search Advice | GoJobWise",
    description: "Expert career advice, interview preparation guides, resume tips, and job search strategies to help freshers and developers land their dream job in India.",
    ogType: "website",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/blog`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-14">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Career Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Tips, Guides &{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Career Advice
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Real strategies to land your dream job — interview guides, resume tips, and salary insights.
          </p>
        </div>

        {/* Posts grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 h-72 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                {/* Cover */}
                {post.coverImage ? (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary/20 via-violet-500/10 to-zinc-900 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary/40" />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5">
                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.split(",").slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <h2 className="text-white font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.createdAt}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readingTime(post.excerpt)}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
