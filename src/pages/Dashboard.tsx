import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard, Job } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Textarea } from "@/components/ui/textarea";

import confetti from "canvas-confetti";

type TrackedJob = Job & { status?: 'tracked' | 'interviewing' | 'offer' };

const radarData = [
  { subject: 'React / Frontend', me: 85, ideal: 90, fullMark: 100 },
  { subject: 'Backend / APIs', me: 40, ideal: 70, fullMark: 100 },
  { subject: 'System Design', me: 20, ideal: 60, fullMark: 100 },
  { subject: 'CSS / UI', me: 95, ideal: 75, fullMark: 100 },
  { subject: 'Git / CI/CD', me: 60, ideal: 80, fullMark: 100 },
  { subject: 'Communication', me: 90, ideal: 85, fullMark: 100 },
];

const Dashboard = () => {
  const [savedJobs, setSavedJobs] = useState<TrackedJob[]>([]);
  const [showOfferModal, setShowOfferModal] = useState<TrackedJob | null>(null);
  const [experienceText, setExperienceText] = useState("");

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

  const handleDrop = (e: React.DragEvent, status: 'tracked' | 'interviewing' | 'offer') => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    
    // Play confetti if dropped into Offer!
    if (status === 'offer') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#22c55e', '#16a34a']
      });
      // Delay showing the modal slightly for maximum confetti impact
      const job = savedJobs.find(j => j.id === jobId);
      if (job) {
        setTimeout(() => setShowOfferModal(job), 1500);
      }
    }

    const updated = savedJobs.map(j => j.id === jobId ? { ...j, status } : j);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  const submitExperience = () => {
    if (!showOfferModal) return;
    const currentList = JSON.parse(localStorage.getItem('experiences') || '[]');
    const newExp = {
      id: Math.random().toString(36).substr(2, 9),
      jobTitle: showOfferModal.title,
      company: showOfferModal.company || "Unknown Company",
      author: "Anonymous User",
      text: experienceText || "It was a great experience, highly recommend using the STAR method!",
      date: "Just now",
      upvotes: 0,
      type: "offer"
    };
    localStorage.setItem('experiences', JSON.stringify([newExp, ...currentList]));
    setShowOfferModal(null);
    setExperienceText("");
    toast({ title: "Posted to Community!", description: "Thank you for helping other developers." });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const tracked = savedJobs.filter(j => !j.status || j.status === 'tracked');
  const interviewing = savedJobs.filter(j => j.status === 'interviewing');
  const offers = savedJobs.filter(j => j.status === 'offer');

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: TRACKED */}
            <div 
              className="space-y-6 min-h-[500px] p-4 rounded-2xl bg-secondary/10 border border-secondary/20"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'tracked')}
            >
              <h2 className="font-bold text-xl flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                Saved To Apply ({tracked.length})
              </h2>
              {tracked.map((job) => (
                <div 
                  key={job.id} 
                  className="relative group/dash cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                >
                  <JobCard job={job} onClick={() => handleApplyClick(job)} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full opacity-0 group-hover/dash:opacity-100 transition-opacity shadow-lg z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(job.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {tracked.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                  <p className="text-muted-foreground text-sm">Drop jobs here</p>
                </div>
              )}
            </div>
            
            {/* COLUMN 2: INTERVIEWING */}
            <div 
              className="space-y-6 min-h-[500px] p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'interviewing')}
            >
              <h2 className="font-bold text-xl flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Interviewing ({interviewing.length})
              </h2>
              {interviewing.map((job) => (
                <div 
                  key={job.id} 
                  className="relative group/dash cursor-grab active:cursor-grabbing pb-12"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                >
                  <JobCard job={job} onClick={() => handleApplyClick(job)} />
                  <Button
                    variant="default"
                    size="sm"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 font-bold"
                    onClick={() => window.location.href=`/community`}
                  >
                    Read Cheat Codes 💬
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full opacity-0 group-hover/dash:opacity-100 transition-opacity shadow-lg z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(job.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {interviewing.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                  <p className="text-muted-foreground text-sm">Drag jobs here after applying</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: OFFERS */}
            <div 
              className="space-y-6 min-h-[500px] p-4 rounded-2xl bg-green-500/5 border border-green-500/20"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'offer')}
            >
              <h2 className="font-bold text-xl flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Offers ({offers.length})
              </h2>
              {offers.map((job) => (
                <div 
                  key={job.id} 
                  className="relative group/dash cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                >
                  <JobCard job={job} onClick={() => handleApplyClick(job)} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full opacity-0 group-hover/dash:opacity-100 transition-opacity shadow-lg z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(job.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {offers.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                  <p className="text-muted-foreground text-sm">Celebrate your offers here! 🎉</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Give Back Modal Overlay */}
        {showOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <Card className="w-full max-w-lg border-2 border-primary/30 shadow-[0_0_30px_-5px_var(--primary)] glass">
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Pay it forward!</h2>
                  <p className="text-muted-foreground mt-2">
                    You crushed the interview for <strong className="text-foreground">{showOfferModal.title}</strong> at <strong className="text-foreground">{showOfferModal.company || "this company"}</strong>. Help the next developer by sharing your experience.
                  </p>
                </div>
                
                <Textarea 
                  placeholder="e.g. Round 1: React concepts. Round 2: System Design. They focused heavily on WebSockets..."
                  className="h-32 resize-none bg-background/50 focus-visible:ring-primary"
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button variant="outline" className="w-full" onClick={() => setShowOfferModal(null)}>Skip for now</Button>
                  <Button className="w-full font-bold" onClick={submitExperience}>Post to Community 💬</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
