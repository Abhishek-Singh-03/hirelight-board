import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard, Job } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import { usePageSEO } from "@/lib/seo";
import { API_BASE_URL } from "@/lib/api";

type TrackedJob = Job & { status?: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' };

const defaultRadarData = [
  { subject: 'React / Frontend', me: 85, ideal: 90, fullMark: 100 },
  { subject: 'Backend / APIs', me: 40, ideal: 70, fullMark: 100 },
  { subject: 'System Design', me: 20, ideal: 60, fullMark: 100 },
  { subject: 'CSS / UI', me: 95, ideal: 75, fullMark: 100 },
  { subject: 'Git / CI/CD', me: 60, ideal: 80, fullMark: 100 },
  { subject: 'Communication', me: 90, ideal: 85, fullMark: 100 },
];

const Dashboard = () => {
  usePageSEO({
    title: "My Dashboard | HireLight",
    description: "Track your job applications with a Kanban board. Move jobs from Saved to Applied to Offer. View your skill gap radar chart and share interview experiences.",
  });

  const [savedJobs, setSavedJobs] = useState<TrackedJob[]>([]);
  const [showOfferModal, setShowOfferModal] = useState<TrackedJob | null>(null);
  const [experienceText, setExperienceText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [radarData, setRadarData] = useState(defaultRadarData);
  const [activeMobileTab, setActiveMobileTab] = useState<'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'>('saved');
  const { user } = useAuth();

  useEffect(() => {
    // 1. Fetch Saved Jobs from Backend
    if (user?.token) {
      fetch(`${API_BASE_URL}/jobs/tracked`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        // Map status to lowercase for frontend board UI state
        const mapped = data.map((j: any) => ({
          ...j,
          status: j.status ? j.status.toLowerCase() : "saved"
        }));
        setSavedJobs(mapped);
      })
      .catch(err => {
        console.error("Failed to load tracked jobs from backend:", err);
        const jobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setSavedJobs(jobs);
      });
    } else {
      const jobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      setSavedJobs(jobs);
    }

    // 2. Fetch Logged-in User Skills from MySQL
    const userId = user?.userId;
    if (userId) {
      fetch(`${API_BASE_URL}/talent/${userId}`)
      .then(res => res.json())
      .then(user => {
        try {
          const parsedSkills = JSON.parse(user.skills);
          if (parsedSkills && Object.keys(parsedSkills).length > 0) {
             const dynamicRadar = Object.keys(parsedSkills).map(subject => ({
               subject,
               me: parsedSkills[subject],
               ideal: Math.floor(Math.random() * 30) + 70, // Generate a mock ideal score for comparison
               fullMark: 100
             }));
             setRadarData(dynamicRadar);
          }
        } catch(e) {
          // Keep default if user has no JSON skills in DB yet
        }
      })
      .catch(err => console.error("Failed to fetch user skills", err));
    }
  }, [user]);

  const handleRemove = async (jobId: string) => {
    if (user?.token) {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/track`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });
        if (!res.ok) throw new Error("Failed to delete from server");
      } catch (err) {
        console.error("Job delete sync failed:", err);
      }
    }

    const updated = savedJobs.filter((j) => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
    toast({ title: "Job removed", description: "Removed from your tracker." });
  };

  const handleApplyClick = (job: Job) => {
    window.open(job.applyLink, "_blank");
  };

  const moveJob = async (jobId: string, status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected') => {
    if (status === 'offer') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#22c55e', '#16a34a']
      });
      const job = savedJobs.find(j => j.id === jobId);
      if (job) {
        setTimeout(() => setShowOfferModal(job), 1500);
      }
    }

    // Call Backend API to update status
    if (user?.token) {
      try {
        const uppercaseStatus = status.toUpperCase();
        const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/stage?status=${uppercaseStatus}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });
        if (!res.ok) throw new Error("Failed to update status on server");
      } catch (err) {
        console.error("Status update sync failed:", err);
      }
    }

    const updated = savedJobs.map(j => j.id === jobId ? { ...j, status } : j);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  const handleDrop = (e: React.DragEvent, status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected') => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    moveJob(jobId, status);
  };

  const submitExperience = async () => {
    if (!showOfferModal) return;
    
    if (experienceText.trim().length < 50) {
      toast({ title: "Too short", description: "Please write at least 50 characters to help others!", variant: "destructive" });
      return;
    }

    const authRaw = localStorage.getItem("hl_auth");
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);

    const payload = {
      jobTitle: showOfferModal.title,
      company: showOfferModal.company || "Unknown Company",
      text: experienceText.trim(),
      type: "offer",
      anonymous: isAnonymous
    };

    try {
      const res = await fetch(`${API_BASE_URL}/community`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed");
      }

      setShowOfferModal(null);
      setExperienceText("");
      setIsAnonymous(false);
      toast({ title: "Posted to Community!", description: "Thank you for helping other developers." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not post to community. Try again later.", variant: "destructive" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const saved = savedJobs.filter(j => !j.status || j.status === 'saved');
  const applied = savedJobs.filter(j => j.status === 'applied');
  const interviewing = savedJobs.filter(j => j.status === 'interviewing');
  const offers = savedJobs.filter(j => j.status === 'offer');
  const rejected = savedJobs.filter(j => j.status === 'rejected');

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
          <>
            {/* Mobile Tabs */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Button 
                variant={activeMobileTab === 'saved' ? 'default' : 'outline'} 
                onClick={() => setActiveMobileTab('saved')}
                className="rounded-full shrink-0 shadow-sm"
              >
                Saved ({saved.length})
              </Button>
              <Button 
                variant={activeMobileTab === 'applied' ? 'default' : 'outline'} 
                onClick={() => setActiveMobileTab('applied')}
                className="rounded-full shrink-0 shadow-sm"
              >
                Applied ({applied.length})
              </Button>
              <Button 
                variant={activeMobileTab === 'interviewing' ? 'default' : 'outline'} 
                onClick={() => setActiveMobileTab('interviewing')}
                className="rounded-full shrink-0 shadow-sm"
              >
                Interviewing ({interviewing.length})
              </Button>
              <Button 
                variant={activeMobileTab === 'offer' ? 'default' : 'outline'} 
                onClick={() => setActiveMobileTab('offer')}
                className="rounded-full shrink-0 shadow-sm"
              >
                Offers ({offers.length})
              </Button>
              <Button 
                variant={activeMobileTab === 'rejected' ? 'default' : 'outline'} 
                onClick={() => setActiveMobileTab('rejected')}
                className="rounded-full shrink-0 shadow-sm"
              >
                Rejected ({rejected.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* COLUMN 1: SAVED */}
              <div 
                className={`space-y-4 min-h-[500px] p-3 rounded-2xl bg-secondary/10 border border-secondary/20 ${activeMobileTab !== 'saved' ? 'hidden lg:block' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'saved')}
              >
                <h2 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Saved ({saved.length})
                </h2>
                <div className="space-y-3">
                  {saved.map((job) => (
                    <div 
                      key={job.id} 
                      className="relative group/dash cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                    >
                      <JobCard job={job} onClick={() => handleApplyClick(job)} hideTrackButton={true} disableSwipe={true} />
                      <div className="lg:hidden mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'applied')}>Move to Applied ➔</Button>
                      </div>
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
                  {saved.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                      <p className="text-muted-foreground text-xs">Drop jobs here</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* COLUMN 2: APPLIED */}
              <div 
                className={`space-y-4 min-h-[500px] p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 ${activeMobileTab !== 'applied' ? 'hidden lg:block' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'applied')}
              >
                <h2 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  Applied ({applied.length})
                </h2>
                <div className="space-y-3">
                  {applied.map((job) => (
                    <div 
                      key={job.id} 
                      className="relative group/dash cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                    >
                      <JobCard job={job} onClick={() => handleApplyClick(job)} hideTrackButton={true} disableSwipe={true} />
                      <div className="lg:hidden mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'saved')}>⬅ Back</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'interviewing')}>Interviewing ➔</Button>
                      </div>
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
                  {applied.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                      <p className="text-muted-foreground text-xs">Drop applied jobs here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: INTERVIEWING */}
              <div 
                className={`space-y-4 min-h-[500px] p-3 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 ${activeMobileTab !== 'interviewing' ? 'hidden lg:block' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'interviewing')}
              >
                <h2 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-yellow-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  Interviewing ({interviewing.length})
                </h2>
                <div className="space-y-3">
                  {interviewing.map((job) => (
                    <div 
                      key={job.id} 
                      className="relative group/dash cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                    >
                      <JobCard job={job} onClick={() => handleApplyClick(job)} hideTrackButton={true} disableSwipe={true} />
                      <div className="lg:hidden mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'applied')}>⬅ Back</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold text-green-500 border-green-500/20" onClick={() => moveJob(job.id, 'offer')}>Offer! ➔</Button>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold text-red-500 border-red-500/20" onClick={() => moveJob(job.id, 'rejected')}>Reject ➔</Button>
                      </div>
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
                      <p className="text-muted-foreground text-xs">Drop interviewing jobs here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 4: OFFERS */}
              <div 
                className={`space-y-4 min-h-[500px] p-3 rounded-2xl bg-green-500/5 border border-green-500/20 ${activeMobileTab !== 'offer' ? 'hidden lg:block' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'offer')}
              >
                <h2 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-green-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  Offers ({offers.length})
                </h2>
                <div className="space-y-3">
                  {offers.map((job) => (
                    <div 
                      key={job.id} 
                      className="relative group/dash cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                    >
                      <JobCard job={job} onClick={() => handleApplyClick(job)} hideTrackButton={true} disableSwipe={true} />
                      <div className="lg:hidden mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'interviewing')}>⬅ Back</Button>
                      </div>
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
                      <p className="text-muted-foreground text-xs">Got an offer? 🎉 Drop it here!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 5: REJECTED */}
              <div 
                className={`space-y-4 min-h-[500px] p-3 rounded-2xl bg-red-500/5 border border-red-500/20 ${activeMobileTab !== 'rejected' ? 'hidden lg:block' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'rejected')}
              >
                <h2 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Rejected ({rejected.length})
                </h2>
                <div className="space-y-3">
                  {rejected.map((job) => (
                    <div 
                      key={job.id} 
                      className="relative group/dash cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
                    >
                      <JobCard job={job} onClick={() => handleApplyClick(job)} hideTrackButton={true} disableSwipe={true} />
                      <div className="lg:hidden mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => moveJob(job.id, 'interviewing')}>⬅ Back</Button>
                      </div>
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
                  {rejected.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-center opacity-50">
                      <p className="text-muted-foreground text-xs">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
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
                
                <div className="space-y-1">
                  <Textarea 
                    placeholder="Walk us through your interview process — rounds, topics asked, salary offered, tips for others..."
                    className="h-32 resize-none bg-background/50 focus-visible:ring-primary"
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>min 50 chars</span>
                    <span>{experienceText.length} / 5000</span>
                  </div>
                </div>

                <div 
                  onClick={() => setIsAnonymous(v => !v)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                    isAnonymous 
                      ? 'bg-primary/10 border-primary/40' 
                      : 'bg-background/30 border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all ${
                    isAnonymous ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground'
                  }`}>
                    {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {isAnonymous ? 'Posting Anonymously' : 'Post with your name'}
                    </p>
                  </div>
                  <div className={`h-4 w-8 rounded-full transition-all flex items-center px-0.5 ${
                    isAnonymous ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}>
                    <div className="h-3 w-3 rounded-full bg-white shadow" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setShowOfferModal(null)}>Skip for now</Button>
                  <Button className="w-full font-bold" onClick={submitExperience}>Post {isAnonymous ? 'Anonymously' : 'to Community'}</Button>
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
