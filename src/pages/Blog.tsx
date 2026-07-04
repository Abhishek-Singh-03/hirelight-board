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

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const standardPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="h-3.5 w-3.5" /> Publication
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight px-2">
            The Job <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Strategy</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-medium px-4">
            Deep dives, career advice, and industry insights to help you land your dream tech role.
          </p>
        </div>

        {loading ? (
          <div className="space-y-12">
            <div className="w-full h-96 rounded-3xl border border-zinc-800 bg-zinc-900/60 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 h-80 animate-pulse" />
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-3xl border border-zinc-800/50 mx-4">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium">No articles yet.</p>
            <p className="text-sm mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post - Stable & Responsive Split Layout */}
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="group flex flex-col-reverse lg:flex-row items-stretch bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden hover:border-primary/40 transition-colors duration-300"
              >
                {/* Content Side */}
                <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-3 py-1 w-fit mb-6">
                    Latest Release
                  </Badge>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-base md:text-lg text-zinc-400 mb-8 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center flex-wrap gap-4 text-xs md:text-sm text-zinc-500 mt-auto">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {featuredPost.createdAt}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readingTime(featuredPost.excerpt)}</span>
                    <span className="font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Image Side */}
                {featuredPost.coverImage && (
                  <div className="w-full lg:w-2/5 xl:w-1/2 min-h-[300px] lg:min-h-full overflow-hidden bg-zinc-100 border-b lg:border-b-0 lg:border-l border-zinc-800 flex items-center justify-center p-6">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
              </Link>
            )}

            {/* Standard Posts Grid - Clean CSS Transitions */}
            {standardPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white">More Articles</h3>
                  <div className="h-px bg-zinc-800 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Cover */}
                      {post.coverImage ? (
                        <div className="h-52 overflow-hidden bg-zinc-100 relative border-b border-zinc-800 p-4 flex items-center justify-center">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-b border-zinc-800">
                          <BookOpen className="h-10 w-10 text-zinc-700" />
                        </div>
                      )}

                      <div className="flex flex-col flex-1 p-6">
                        {/* Tags */}
                        {post.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.split(",").slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 uppercase tracking-wide">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <h2 className="text-white font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        
                        <p className="text-zinc-400 text-sm leading-relaxed flex-1 line-clamp-3 mb-6">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.createdAt}</span>
                          <span className="font-medium text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                            Read <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
