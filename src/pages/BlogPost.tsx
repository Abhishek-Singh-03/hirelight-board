import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import { Calendar, Clock, ArrowLeft, BookOpen, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePageSEO } from "@/lib/seo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { motion, useScroll, useSpring } from "framer-motion";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

function readingTime(content: string) {
  const words = (content || "").split(" ").length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<{id: string, text: string, level: number}[]>([]);

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Dynamic SEO meta tags per post
  usePageSEO({
    title: post ? post.title : "Blog",
    description: post?.excerpt || "Career tips, interview guides and job search strategies on GoJobWise.",
    ogImage: post?.coverImage || "https://gojobwise.com/og-image.png",
    ogType: "article",
  });

  // Canonical link — tells Google the authoritative URL for this post
  useEffect(() => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    return () => { if (canonical) canonical.href = ""; };
  }, [slug]);

  // JSON-LD Article structured data — Google shows rich snippets from this
  useEffect(() => {
    if (!post) return;
    const existing = document.getElementById("blog-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "blog-jsonld";
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.coverImage || "https://gojobwise.com/og-image.png",
      "author": { "@type": "Person", "name": post.authorName },
      "publisher": {
        "@type": "Organization",
        "name": "GoJobWise",
        "logo": { "@type": "ImageObject", "url": "https://gojobwise.com/logo.png" }
      },
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt,
      "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
    });
    document.head.appendChild(script);
    return () => { document.getElementById("blog-jsonld")?.remove(); };
  }, [post]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/blog/${slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(data => { setPost(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  // Extract headings for TOC
  useEffect(() => {
    if (!post) return;
    const extractedHeadings: {id: string, text: string, level: number}[] = [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      let text = match[2].trim();
      text = text.replace(/[*_`~[\]()]/g, ''); // strip basic markdown from text
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      extractedHeadings.push({
        id,
        text,
        level: match[1].length
      });
    }
    setHeadings(extractedHeadings);
  }, [post]);

  // Scroll Spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200; // Offset for top header
      
      let currentId = activeId;
      for (const el of headingElements) {
        if (el && el.offsetTop <= scrollPosition) {
          currentId = el.id;
        }
      }
      setActiveId(currentId);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings, activeId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this article with your network." });
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-zinc-400">
      <BookOpen className="h-16 w-16 opacity-20" />
      <p className="text-xl font-semibold">Article not found</p>
      <Link to="/blog"><Button variant="outline">Back to Blog</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left" 
        style={{ scaleX }} 
      />

      <div className="relative z-40">
        <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
      </div>

      {/* Magazine Hero Header */}
      {post.coverImage ? (
        <div className="w-full max-w-4xl mx-auto px-4 pt-32 pb-8 flex flex-col items-center text-center relative z-10">
          {post.tags && (
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
              {post.tags.split(",").map(tag => (
                <Badge key={tag} variant="secondary" className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 backdrop-blur-md text-[10px] md:text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 md:mb-8 drop-shadow-lg px-2">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center flex-wrap gap-5 text-sm text-zinc-400 mb-10">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-lg">
                {post.authorName.charAt(0)}
              </div>
              <span className="font-medium text-white">{post.authorName}</span>
            </span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {post.createdAt}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {readingTime(post.content)}</span>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </div>
        </div>
      ) : (
        <div className="pt-24 md:pt-32 pb-12 md:pb-16 text-center max-w-4xl mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 md:mb-8 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Blog
          </Link>
          {post.tags && (
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
              {post.tags.split(",").map(tag => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6 md:mb-8 px-2">
            {post.title}
          </h1>
          <div className="flex items-center justify-center flex-wrap gap-5 text-sm text-zinc-400">
            <span className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {post.authorName.charAt(0)}
              </div>
              {post.authorName}
            </span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {post.createdAt}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {readingTime(post.content)}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Main Content Area */}
        <div className="flex-1 max-w-3xl lg:max-w-4xl mx-auto">
          {post.coverImage && (
            <div className="mb-8 hidden lg:flex justify-between items-center pb-4 border-b border-zinc-800">
              <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Blog
              </Link>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs hover:text-primary">
                <Share2 className="h-3.5 w-3.5" /> Share Article
              </Button>
            </div>
          )}
          
          <article className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:scroll-mt-24 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:text-primary prose-code:bg-zinc-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Footer CTA */}
          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <div className="relative z-10">
              <h3 className="text-white font-black text-2xl mb-3">Ready to find your next job?</h3>
              <p className="text-zinc-400 text-base mb-6">Browse 2,000+ opportunities on GoJobWise</p>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-lg shadow-[0_0_20px_-5px_var(--primary)] group-hover:shadow-[0_0_30px_0px_var(--primary)] transition-all">
                  Browse Jobs Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-72 shrink-0 relative">
            <div className="sticky top-28 space-y-4 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BookOpen className="h-4 w-4 text-primary"/> In this article
              </h4>
              <nav className="flex flex-col gap-3 text-sm">
                {headings.map(h => (
                  <a 
                    key={h.id} 
                    href={`#${h.id}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`transition-all duration-200 line-clamp-2 border-l-2 pl-3 py-0.5 ${
                      activeId === h.id 
                        ? 'text-primary font-medium border-primary' 
                        : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700'
                    } ${h.level === 3 ? 'ml-3 text-xs' : ''}`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
        
      </main>

      <Footer />
    </div>
  );
}
