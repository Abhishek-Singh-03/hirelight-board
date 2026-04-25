import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard, Job } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const radarData = [
  { subject: 'React / Frontend', me: 85, ideal: 90, fullMark: 100 },
  { subject: 'Backend / APIs', me: 40, ideal: 70, fullMark: 100 },
  { subject: 'System Design', me: 20, ideal: 60, fullMark: 100 },
  { subject: 'CSS / UI', me: 95, ideal: 75, fullMark: 100 },
  { subject: 'Git / CI/CD', me: 60, ideal: 80, fullMark: 100 },
  { subject: 'Communication', me: 90, ideal: 85, fullMark: 100 },
];

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

        {/* Skill Gap Visualizer */}
        <div className="mb-12">
          <Card className="border-2 border-primary/20 bg-background/50 backdrop-blur glass">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Skill Gap Visualizer
                </div>
                <h2 className="text-2xl font-bold">You vs. The Ideal Candidate</h2>
                <p className="text-muted-foreground text-sm">
                  We've analyzed the jobs you track. Here is your current Radar Chart compared to what companies are actively asking for. 
                  Focus your learning on <strong className="text-destructive">System Design</strong> and <strong className="text-destructive">Backend Development</strong> to increase your hiring chances by 34%.
                </p>
              </div>
              <div className="w-full md:w-[400px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#888" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} />
                    <Tooltip cursor={{ stroke: 'white', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'black', borderRadius: '10px' }} />
                    <Legend />
                    <Radar name="My Skills" dataKey="me" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                    <Radar name="Market Demand" dataKey="ideal" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
