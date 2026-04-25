import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard, Job } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(jobs);
  }, []);

  const handleRemove = (jobId: string) => {
    const updated = savedJobs.filter((j) => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
    toast({ title: "Job removed", description: "Removed from your tracker." });
  };

  const handleApplyClick = (job: Job) => {
    window.open(job.applyLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchTerm={""}
        onSearchChange={() => {}}
        onSearchSubmit={() => {}}
      />

      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and manage your saved job opportunities here.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <Card className="p-12 text-center border-2 border-primary/20 bg-background/50 backdrop-blur glass">
            <CardContent className="space-y-4 pt-6">
              <div className="text-6xl mb-4">📌</div>
              <h3 className="text-xl font-semibold">Your board is empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't saved any jobs yet. Go to the home page, find some
                jobs you like, and hit the Track button to build your board!
              </p>
              <Button onClick={() => window.location.href = "/"} className="mt-4">
                Explore Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                Saved To Apply ({savedJobs.length})
              </h2>
              {savedJobs.map((job) => (
                <div key={job.id} className="relative group/dash">
                  <JobCard job={job} onClick={() => handleApplyClick(job)} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full opacity-0 group-hover/dash:opacity-100 transition-opacity shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(job.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Example Kanban Empty Columns to feel like a real tracker */}
            <div className="space-y-6 opacity-60 pointer-events-none">
              <h2 className="font-bold text-xl flex items-center gap-2 text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Interviewing (0)
              </h2>
              <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">Drag jobs here after you apply. <br/>(Premium Feature)</p>
              </div>

              <h2 className="font-bold text-xl flex items-center gap-2 text-muted-foreground mt-8">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Offers (0)
              </h2>
              <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">Celebrate your offers here. <br/>(Premium Feature)</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
