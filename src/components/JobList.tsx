import { useState, useEffect } from "react";
import { JobCard, Job } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface JobListProps {
  jobs: Job[];
  searchTerm: string;
  selectedCategory: string;
  onJobClick: (job: Job) => void;
  loading: boolean;
  resumeText?: string;
}

export function JobList({ jobs, searchTerm, selectedCategory, onJobClick, loading, resumeText }: JobListProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Normalize and match category (handles comma, slash, etc.)
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    const selectedCatNorm = normalize(selectedCategory);
    const jobCatNorm = normalize(job.category);

    const matchesCategory =
      selectedCategory === "all" ||
      jobCatNorm.split(" ").includes(selectedCatNorm) ||
      jobCatNorm.includes(selectedCatNorm);

    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const jobsToShow = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCurrentSwipeIndex(0); // reset swipe index on page change
    }
  };

  const handleSwipeSave = (job: Job) => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if(!saved.find((s: Job) => s.id === job.id)) {
      saved.push(job);
      localStorage.setItem('savedJobs', JSON.stringify(saved));
    }
    setCurrentSwipeIndex(prev => prev + 1);
  };

  const handleSwipePass = () => {
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
        handleSwipePass();
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSwipeMode(!isSwipeMode)}
            className="border-primary/50 hover:bg-primary/10 text-primary"
          >
            {isSwipeMode ? "Grid View ⊞" : "Focus Swipe Mode ✨"}
          </Button>

          <div className="text-sm text-muted-foreground hidden md:block">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {isSwipeMode ? (
        <div className="flex justify-center items-center py-12 px-4 h-[600px]">
          {currentSwipeIndex < jobsToShow.length ? (
            <div className="w-full max-w-md relative">
              {(() => {
                const job = jobsToShow[currentSwipeIndex];
                let matchScore: number | undefined = undefined;
                if (resumeText && resumeText.trim().length > 10) {
                  const rWords = resumeText.toLowerCase().match(/\b\w{4,}\b/g) || [];
                  const jWords = `${job.title} ${job.description || ''} ${job.category}`.toLowerCase().match(/\b\w{4,}\b/g) || [];
                  if (jWords.length > 0) {
                    const uniqueJ = [...new Set(jWords)];
                    const intersection = uniqueJ.filter(w => rWords.includes(w));
                    matchScore = Math.min(100, Math.round((intersection.length / uniqueJ.length) * 200 + 30)); 
                  } else {
                    matchScore = 65; 
                  }
                }
                return (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={() => onJobClick(job)} 
                    matchScore={matchScore} 
                    onSwipeLeft={handleSwipePass}
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
                    onClick={() => handleSwipePass()}
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
        <div className="grid gap-6">
          {jobsToShow.map((job) => {
            // Calculate match score
            let matchScore: number | undefined = undefined;
            if (resumeText && resumeText.trim().length > 10) {
              const rWords = resumeText.toLowerCase().match(/\b\w{4,}\b/g) || [];
              const jWords = `${job.title} ${job.description || ''} ${job.category}`.toLowerCase().match(/\b\w{4,}\b/g) || [];
              if (jWords.length > 0) {
                const uniqueJ = [...new Set(jWords)];
                const intersection = uniqueJ.filter(w => rWords.includes(w));
                matchScore = Math.min(100, Math.round((intersection.length / uniqueJ.length) * 200 + 30)); // fake boost for demo
              } else {
                matchScore = 65; // default fallback
              }
            }

            return (
              <div key={job.id}>
                <JobCard job={job} onClick={() => onJobClick(job)} matchScore={matchScore} />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
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
    </div>
  );
}
