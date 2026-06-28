import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import { Calendar, Clock, ArrowLeft, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePageSEO } from "@/lib/seo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80 bg-zinc-100 flex items-center justify-center p-8">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-contain" />
          </div>
        )}

        {/* Tags */}
        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.split(",").map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-6 mb-8 border-b border-zinc-800">
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {post.authorName.charAt(0)}
              </div>
              {post.authorName}
            </span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{post.createdAt}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readingTime(post.content)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>

        {/* Content */}
        <article className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:text-primary prose-code:bg-zinc-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-white font-bold text-xl mb-2">Ready to find your next job?</p>
          <p className="text-zinc-400 text-sm mb-5">Browse 2,000+ opportunities on GoJobWise</p>
          <Link to="/"><Button className="bg-primary hover:bg-primary/90 text-white px-8">Browse Jobs</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
