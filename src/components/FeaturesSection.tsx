import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, LayoutDashboard, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    icon: Heart,
    color: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    borderColor: "group-hover:border-rose-500/50",
    glowColor: "bg-rose-500/10",
    title: "Swipe to Save Jobs",
    subtitle: "Tinder for Jobs",
    description:
      "Swipe right on jobs you love, left to skip. No more endless scrolling — GoJobWise remembers your picks.",
    badge: "🔥 Most Popular",
  },
  {
    icon: LayoutDashboard,
    color: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    borderColor: "group-hover:border-violet-500/50",
    glowColor: "bg-violet-500/10",
    title: "Track Every Application",
    subtitle: "Kanban Board",
    description:
      "Your personal job tracker. Move applications from Saved → Applied → Interviewing → Offer. Never lose track again.",
    badge: "✨ Free Forever",
  },
  {
    icon: FileText,
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    borderColor: "group-hover:border-emerald-500/50",
    glowColor: "bg-emerald-500/10",
    title: "AI Cover Letter Generator",
    subtitle: "Write in Seconds",
    description:
      "Paste your resume on any job page. Our AI reads both and instantly crafts a tailored cover letter that gets interviews.",
    badge: "🤖 AI Powered",
  },
  {
    icon: Sparkles,
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    borderColor: "group-hover:border-amber-500/50",
    glowColor: "bg-amber-500/10",
    title: "AI Resume Matching",
    subtitle: "Find Your Best Fit",
    description:
      "Paste your resume and we'll instantly filter 2,000+ jobs to only show roles that match your exact skill set.",
    badge: "⚡ Instant",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />

      <div className="container mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-4 py-1.5 rounded-full">
            <Sparkles className="h-4 w-4" />
            Why GoJobWise?
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Job hunting,{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              reimagined.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Sign up free and unlock tools that help you apply smarter, not harder.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              className={`group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${f.borderColor}`}
            >
              {/* Glow orb */}
              <div
                className={`absolute top-0 right-0 w-40 h-40 ${f.glowColor} rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />

              <div className="relative z-10 flex flex-col h-full gap-4">
                {/* Top row: icon + badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center border border-white/5`}
                  >
                    <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full">
                    {f.badge}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                    {f.subtitle}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/25 group"
          >
            Get Started — It's Free
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-zinc-500 text-sm mt-3">No credit card required. 2,000+ jobs ready.</p>
        </div>
      </div>
    </section>
  );
}
