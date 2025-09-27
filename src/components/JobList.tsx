import { useState, useEffect } from "react";
import { JobCard, Job } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface JobListProps {
  jobs?: Job[]; // optional, since we fetch inside
  searchTerm: string;
  selectedCategory: string;
  onJobClick: (job: Job) => void;
}

export function JobList({ searchTerm, selectedCategory, onJobClick }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://opensheet.elk.sh/1s1a2XpHEmQnIATVQwK2VXszUPwAh306GWtkYbkBfFOY/Sheet1"
        );
        const data = await response.json();

        const formattedJobs: Job[] = data.map((row: any, index: number) => ({
          id: String(index + 1),
          title: row.Title || "Untitled Job",
          company: row.Company || "Unknown Company",
          location: row.Location || "N/A",
          applyLink: row.ApplyLink || "#",
          postedOn: row.PostedOn || "",
          category: row.Category?.toLowerCase() || "other",
          description: row.Description || "No description provided.",
          salary: row.Salary || "Not specified",
          type: row.Type || "Full-time",
        }));

        // Sort latest first
        formattedJobs.sort((a, b) => {
          const dateA = dayjs(a.postedOn, "DD/MM/YYYY HH:mm");
          const dateB = dayjs(b.postedOn, "DD/MM/YYYY HH:mm");
          return dateB.valueOf() - dateA.valueOf();
        });

        setJobs(formattedJobs);
      } catch (err) {
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;

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
    }
  };

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
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""} Found
        </h2>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-6">
        {jobsToShow.map((job, index) => (
          <div key={job.id}>
            <JobCard job={job} onClick={() => onJobClick(job)} />
            {(index + 1) % 3 === 0 && index < jobsToShow.length - 1 && (
              <Card className="mt-6 bg-muted/30 border-dashed border-2">
                <CardContent className="p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    Advertisement
                  </div>
                  <div className="h-20 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      Inline Ad Space (468x60)
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

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
