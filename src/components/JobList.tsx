import { useState, useEffect, useRef } from "react";
import { JobCard, Job } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, LogIn, X } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";

dayjs.extend(customParseFormat);

interface JobListProps {
  jobs: Job[];
  searchTerm: string;
  selectedCategory: string;
  onJobClick: (job: Job) => void;
  loading: boolean;
  resumeText?: string;
  minLPA?: number;
}

export function JobList({ jobs, searchTerm, selectedCategory, onJobClick, loading, resumeText, minLPA }: JobListProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Show spotlight hint only once per browser
  useEffect(() => {
    const seen = localStorage.getItem("gjw_swipe_hint_seen");
    if (!seen) {
      const t = setTimeout(() => setShowSwipeHint(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismissHint = () => {
    localStorage.setItem("gjw_swipe_hint_seen", "true");
    setShowSwipeHint(false);
  };

  const handleSwipeModeToggle = () => {
    dismissHint();
    setIsSwipeMode(!isSwipeMode);
  };
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // All filtering is now handled natively by the Java Dropwizard backend!
  const filteredJobs = jobs;

  // Reset to page 1 whenever the job list changes (filter/search changed)
  useEffect(() => {
    setCurrentPage(1);
    setCurrentSwipeIndex(0);
  }, [jobs]);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const jobsToShow = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCurrentSwipeIndex(0);
      // Smooth scroll to top of job list
      const jobsEl = document.getElementById("jobs");
      if (jobsEl) jobsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSwipeSave = async (job: Job) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/jobs/${job.id}/stage?status=SAVED`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if(!saved.find((s: Job) => s.id === job.id)) {
        saved.push(job);
        localStorage.setItem('savedJobs', JSON.stringify(saved));
      }
    } catch (err) {
      console.error("Failed to sync swipe save:", err);
    }
    setCurrentSwipeIndex(prev => prev + 1);
  };

  const handleSwipePass = async (job: Job) => {
    if (isAuthenticated) {
      try {
        await fetch(`${API_BASE_URL}/jobs/${job.id}/stage?status=PASSED`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user?.token}`
          }
        });
      } catch (err) {
        console.error("Failed to sync swipe pass:", err);
      }
    }
    setCurrentSwipeIndex(prev => prev + 1);
  };

  // Keyboard navigation for Swipe Mode
  useEffect(() => {
    if (!isSwipeMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      const currentJob = jobsToShow[currentSwipeIndex];
      if (!currentJob) return;

      if (e.key === 'ArrowLeft') {
        handleSwipePass(currentJob);
      } else if (e.key === 'ArrowRight') {
        handleSwipeSave(currentJob);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwipeMode, currentSwipeIndex, jobsToShow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent className="space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h3 className="text-lg font-semibold">Unable to load jobs</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent className="space-y-4">
          <div className="text-4xl">🔍</div>
          <h3 className="text-lg font-semibold">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more
            opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="jobs" className="space-y-6">
      {/* Results Count & View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""} Found
        </h2>
        
        <div className="flex items-center gap-4">
        {/* Focus Swipe Mode button with spotlight hint */}
        <div className="relative">
          {/* Pulsing glow ring — visible only when hint is active */}
          {showSwipeHint && (
            <span className="absolute inset-0 -m-1 rounded-lg animate-ping bg-primary/40 pointer-events-none" />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSwipeModeToggle}
            className="relative border-primary/50 hover:bg-primary/10 text-primary"
          >
            {isSwipeMode ? "Grid View ⊞" : "Focus Swipe Mode ✨"}
          </Button>

          {/* Tooltip bubble */}
          {showSwipeHint && (
            <div className="absolute right-0 top-full mt-3 w-64 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Arrow pointing up */}
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-zinc-800 border-l border-t border-zinc-700 rotate-45" />
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl shadow-black/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-white leading-tight">✨ Try Focus Swipe Mode!</p>
                  <button onClick={dismissHint} className="text-zinc-500 hover:text-white flex-shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  Browse jobs like Tinder — <span className="text-emerald-400 font-semibold">swipe right ❤️</span> to save a job,{" "}
                  <span className="text-rose-400 font-semibold">swipe left ✕</span> to skip. No distractions, just pure focus.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={dismissHint}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Got it
                  </button>
                  <button
                    onClick={handleSwipeModeToggle}
                    className="ml-auto text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Try it now →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

          <div className="text-sm text-muted-foreground hidden md:block">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {isSwipeMode ? (
        <div className="flex justify-center items-center py-12 px-4 min-h-[600px]">
          {currentSwipeIndex < jobsToShow.length ? (
            <div className="w-full max-w-2xl relative transform transition-all duration-300">
              {(() => {
                const job = jobsToShow[currentSwipeIndex];
                let matchScore: number | undefined = undefined;
                if (resumeText && resumeText.trim().length > 10) {
                  const rWords = (resumeText.toLowerCase().match(/\b\w{4,}\b/g) || []) as string[];
                  const jWords = (`${job.title} ${job.description || ''} ${job.category}`).toLowerCase().match(/\b\w{4,}\b/g) || [];
                  if (jWords.length > 0) {
                    const uniqueJ = [...new Set(jWords)] as string[];
                    const intersection = uniqueJ.filter(w => rWords.includes(w));
                    matchScore = Math.min(100, Math.round((intersection.length / uniqueJ.length) * 200 + 30)); 
                  } else {
                    matchScore = 65; 
                  }
                }
                
                let isLocked = false;
                if (minLPA && minLPA > 0 && job.salary) {
                  const nums = job.salary.match(/\d+(\.\d+)?/g);
                  if (nums) {
                    const maxVal = Math.max(...nums.map(n => parseFloat(n)));
                    if (maxVal < minLPA) isLocked = true;
                  }
                }

                return (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={() => onJobClick(job)} 
                    matchScore={matchScore} 
                    isLocked={isLocked}
                    onSwipeLeft={() => handleSwipePass(job)}
                    onSwipeRight={() => handleSwipeSave(job)}
                  />
                );
              })()}
              
              {/* Desktop Buttons & Instructions */}
              <div className="flex flex-col items-center mt-8 space-y-4">
                <div className="flex gap-4 w-full justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1 max-w-[140px] border-destructive/50 hover:bg-destructive/10 text-destructive font-bold text-lg h-14 rounded-2xl"
                    onClick={() => handleSwipePass(jobsToShow[currentSwipeIndex])}
                  >
                    ❌ Pass
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1 max-w-[140px] border-success/50 hover:bg-success/10 text-success font-bold text-lg h-14 rounded-2xl"
                    onClick={() => handleSwipeSave(jobsToShow[currentSwipeIndex])}
                  >
                    💚 Save
                  </Button>
                </div>
                <div className="text-muted-foreground text-sm flex gap-6 mt-2 opacity-70">
                  <span className="flex items-center gap-1"><span className="border border-border rounded px-1 text-xs">←</span> or Swipe Left</span>
                  <span className="flex items-center gap-1"><span className="border border-border rounded px-1 text-xs">→</span> or Swipe Right</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h3 className="text-xl font-semibold">You're all caught up!</h3>
              <p className="text-muted-foreground">You swiped through all jobs on this page.</p>
              <Button onClick={() => setIsSwipeMode(false)}>Return to Grid</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 min-w-0">
          {jobsToShow.map((job) => {
            // Calculate match score
            let matchScore: number | undefined = undefined;
            if (resumeText && resumeText.trim().length > 10) {
              const rWords = (resumeText.toLowerCase().match(/\b\w{4,}\b/g) || []) as string[];
              const jWords = (`${job.title} ${job.description || ''} ${job.category}`).toLowerCase().match(/\b\w{4,}\b/g) || [];
              if (jWords.length > 0) {
                const uniqueJ = [...new Set(jWords)] as string[];
                const intersection = uniqueJ.filter(w => rWords.includes(w));
                matchScore = Math.min(100, Math.round((intersection.length / uniqueJ.length) * 200 + 30)); // fake boost for demo
              } else {
                matchScore = 65; // default fallback
              }
            }

            let isLocked = false;
            if (minLPA && minLPA > 0 && job.salary) {
              const nums = job.salary.match(/\d+(\.\d+)?/g);
              if (nums) {
                const maxVal = Math.max(...nums.map(n => parseFloat(n)));
                if (maxVal < minLPA) isLocked = true;
              }
            }

            return (
              <div key={job.id} className="min-w-0 overflow-hidden">
                <JobCard job={job} onClick={() => onJobClick(job)} matchScore={matchScore} isLocked={isLocked} />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isSwipeMode && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6 flex-wrap overflow-x-auto">
          <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Prev
        </Button>

        {(() => {
          const pages: (number | string)[] = [];
          const maxVisible = 5;

          if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            if (currentPage <= 3) {
              pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
              pages.push(
                1,
                "...",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages
              );
            } else {
              pages.push(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages
              );
            }
          }

          return pages.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={currentPage === p ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(Number(p))}
              >
                {p}
              </Button>
            )
          );
        })()}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
        </div>
      )}

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[420px] border border-border/85 shadow-2xl rounded-2xl bg-zinc-950/95 backdrop-blur-xl">
          <DialogHeader className="space-y-3 pt-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/25">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Save Job to Your Board
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-sm leading-relaxed px-2">
              Create a free account or sign in to save jobs, build your tracking board, and sync your applications across mobile and desktop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pb-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 font-semibold border-zinc-800 hover:bg-zinc-900 transition-all"
              onClick={() => {
                setShowAuthDialog(false);
                navigate("/auth?mode=login");
              }}
            >
              Sign In
            </Button>
            <Button
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={() => {
                setShowAuthDialog(false);
                navigate("/auth?mode=register");
              }}
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
