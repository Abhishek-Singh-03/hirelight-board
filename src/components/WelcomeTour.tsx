import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, LayoutDashboard, FileText, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VISITOR_KEY = "gjw_visitor_tour_v2";
const USER_KEY    = "gjw_user_tour_v2";

const features = [
  {
    icon: Heart,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    label: "Swipe to Save Jobs",
    desc: "Tinder-style swiping for job cards",
  },
  {
    icon: LayoutDashboard,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    label: "Kanban Application Tracker",
    desc: "Track every stage of every application",
  },
  {
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "AI Cover Letter Generator",
    desc: "Paste resume → get a tailored letter instantly",
  },
  {
    icon: Sparkles,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "AI Resume Matching",
    desc: "Filter 2,000+ jobs by your exact skill set",
  },
];

interface WelcomeTourProps {
  mode: "visitor" | "user";
}

export function WelcomeTour({ mode }: WelcomeTourProps) {
  const [open, setOpen] = useState(false);
  const navigate        = useNavigate();
  const storageKey      = mode === "visitor" ? VISITOR_KEY : USER_KEY;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  const close = () => {
    localStorage.setItem(storageKey, "true");
    setOpen(false);
  };

  const handleCta = () => {
    close();
    navigate(mode === "visitor" ? "/signup" : "/dashboard");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl shadow-black border border-zinc-800">

              {/* ── LEFT PANEL ── */}
              <div className="hidden sm:flex flex-col justify-between w-52 flex-shrink-0 bg-gradient-to-br from-zinc-900 via-[#0f0f1a] to-zinc-950 p-6 relative overflow-hidden">
                {/* decorative glow rings */}
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-violet-500/15 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight">GoJobWise</span>
                  </div>
                  <h2 className="text-white font-bold text-xl leading-tight">
                    Job hunting,{" "}
                    <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                      reimagined.
                    </span>
                  </h2>
                  <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
                    Everything you need to land your next role — in one beautiful platform.
                  </p>
                </div>

                {/* Floating feature count */}
                <div className="relative z-10 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-white">2,023+</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Active Jobs</p>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="flex-1 bg-zinc-950 p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                      {mode === "visitor" ? "Welcome to GoJobWise" : `You're all set up! 🎉`}
                    </p>
                    <h3 className="text-lg font-bold text-white">
                      {mode === "visitor"
                        ? "Here's what makes us different"
                        : "Explore your new superpowers"}
                    </h3>
                  </div>
                  <button
                    onClick={close}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5 flex-shrink-0 ml-3"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Feature list */}
                <div className="flex flex-col gap-3 flex-1">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i + 0.1, duration: 0.3 }}
                      className={`flex items-center gap-3.5 rounded-xl border ${f.border} ${f.bg} px-4 py-3`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center`}>
                        <f.icon className={`h-4 w-4 ${f.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{f.label}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={close}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                  >
                    {mode === "visitor" ? "Skip for now" : "Close"}
                  </button>
                  <Button
                    onClick={handleCta}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-10 group shadow-lg shadow-primary/20"
                  >
                    {mode === "visitor" ? "Create Free Account" : "Go to Dashboard"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
