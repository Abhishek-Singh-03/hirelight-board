import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { Footer } from "@/components/Footer";
import ScrollingBanner from "@/components/ScrollingBanner";
import { Job } from "@/components/JobCard";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { usePageSEO } from "@/lib/seo";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const TECH_DICTIONARY = [
  "react", "node", "node.js", "python", "java", "spring", "aws", "docker", 
  "kubernetes", "typescript", "javascript", "sql", "mysql", "mongodb", "graphql", 
  "html", "css", "tailwind", "go", "rust", "c++", "c#", "azure", "gcp", "linux", 
  "git", "ci/cd", "figma", "excel", "leadership", "agile", "scrum", "rest api", "redux",
  "software", "developer", "cloud", "mobile", "web", "testing", "ui", "ux", "analytical",
  "programming", "troubleshooting", "frontend", "backend", "fullstack", "data", "analytics",
  "design", "architecture", "embedded", "systems", "portfolio", "management", "risk", "modules"
];

dayjs.extend(customParseFormat);

const Index = () => {
  usePageSEO({
    title: "HireLight — Find Your Next Tech Job",
    description: "Browse thousands of tech, remote, fresher and government jobs. AI resume matching, Kanban job tracker, salary insights — all in one place. Free forever.",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [resumeText, setResumeText] = useState("");
  const [minLPA, setMinLPA] = useState(0);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypesFilter, setJobTypesFilter] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isRecruiter, user } = useAuth();
  const navigate = useNavigate();

  // Redirect recruiters away from job listings — they have their own dashboard
  useEffect(() => {
    if (isAuthenticated && isRecruiter) {
      navigate("/talent", { replace: true });
    }
  }, [isAuthenticated, isRecruiter]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "all") queryParams.append("category", selectedCategory);
        if (searchTerm) queryParams.append("search", searchTerm);
        if (minLPA > 0) queryParams.append("minLPA", minLPA.toString());
        if (locationFilter) queryParams.append("location", locationFilter);
        if (jobTypesFilter.length > 0) queryParams.append("jobType", jobTypesFilter.join(","));

        // Connect directly to our new Dropwizard Backend with dynamic filters!
        const headers: HeadersInit = {};
        if (isAuthenticated && user?.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }
        const endpoint = `${API_BASE_URL}/jobs?${queryParams.toString()}`;
        const response = await fetch(endpoint, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }
        
        // The Java backend now returns exactly what the frontend expects, perfectly filtered
        const formattedJobs: Job[] = await response.json();

        // Sort latest first
        formattedJobs.sort((a, b) => {
          const dateA = dayjs(a.postedOn, "DD/MM/YYYY HH:mm");
          const dateB = dayjs(b.postedOn, "DD/MM/YYYY HH:mm");
          return dateB.valueOf() - dateA.valueOf();
        });

        setJobs(formattedJobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedCategory, searchTerm, minLPA, locationFilter, jobTypesFilter]);

  const handleClearAllFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setMinLPA(0);
    setLocationFilter("");
    setJobTypesFilter([]);
  };

  const handleSearchSubmit = () => {
    console.log("Searching for:", searchTerm);
  };

  const handleJobClick = (job: Job) => {
    console.log("Job clicked:", job);
    window.open(job.applyLink, "_blank");
  };

  const handleExtractSkills = () => {
    const found = new Set<string>();
    const lowerText = resumeText.toLowerCase();

    // 1. Check against the expanded dictionary
    TECH_DICTIONARY.forEach(skill => {
      if (lowerText.includes(skill)) {
        found.add(skill);
      }
    });

    // 2. Dynamic Acronym Extraction (e.g., API, UI, UX, SQL, AWS)
    // Matches 2 to 4 uppercase letters bounded by non-letters
    const acronymRegex = /\b[A-Z]{2,4}\b/g;
    const acronyms = resumeText.match(acronymRegex);
    if (acronyms) {
      acronyms.forEach(a => {
        if (!["THE", "AND", "FOR", "WITH", "NEW"].includes(a)) {
          found.add(a.toLowerCase());
        }
      });
    }

    // 3. Fallback: If less than 3 skills found, extract capitalized words from the text
    // (Assuming they might be proper nouns or technologies we missed)
    if (found.size < 3) {
      const properNouns = resumeText.match(/\b[A-Z][a-z]{4,}\b/g);
      if (properNouns) {
        const stopWords = new Set(["Master", "Bachelor", "Science", "Computer", "University", "College", "School", "September", "August", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "Worked", "Developed", "Implemented", "Address", "Performed"]);
        properNouns.forEach(noun => {
          if (!stopWords.has(noun)) {
            found.add(noun.toLowerCase());
          }
        });
      }
    }

    // Convert Set to Array, limit to top 12 to avoid overwhelming the UI
    setExtractedSkills(Array.from(found).slice(0, 12));
    setIsAnalyzed(true);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExtractedSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleClearResume = () => {
    setResumeText("");
    setExtractedSkills([]);
    setIsAnalyzed(false);
  };

  // ✅ Compute stats dynamically
  const jobStats = {
    total: jobs.length,
    remote: jobs.filter((job) => job.location.toLowerCase().includes("remote")).length,
    fresher: jobs.filter((job) => job.category === "fresher").length,
    government: jobs.filter((job) => job.category === "government").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />

      {!isAuthenticated && (
        <>
          <ScrollingBanner />
          <HeroSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchSubmit={handleSearchSubmit}
            totalJobs={jobStats.total}
          />
        </>
      )}

      <main className={`container mx-auto px-4 ${isAuthenticated ? 'py-8' : 'py-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              jobTypesFilter={jobTypesFilter}
              onJobTypesChange={setJobTypesFilter}
              onClearAll={handleClearAllFilters}
              jobStats={jobStats}
            />
          </div>

          {/* Job Listings & Smart Tools */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Mobile Filters Trigger */}
            <div className="lg:hidden flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Jobs Feed</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-zinc-950 border-r border-zinc-800 p-0 pt-10 overflow-y-auto w-[300px] sm:w-[350px]">
                  <div className="px-2">
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      locationFilter={locationFilter}
                      onLocationChange={setLocationFilter}
                      jobTypesFilter={jobTypesFilter}
                      onJobTypesChange={setJobTypesFilter}
                      onClearAll={handleClearAllFilters}
                      jobStats={jobStats}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Smart Tools Premium Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Minimum Worth Card */}
              <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-500/20 transition-all duration-500" />
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                      </div>
                      <h3 className="font-bold text-zinc-100">Salary Filter</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800 bg-zinc-900">Auto-Lock</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mb-4 flex-1">
                    Set a hard boundary. We will lock jobs offering below your minimum CTC.
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-950 rounded-xl p-1.5 border border-zinc-800 focus-within:border-orange-500/50 transition-colors">
                    <span className="text-zinc-500 pl-3 font-medium">₹</span>
                    <Input 
                      type="number" 
                      placeholder="Min LPA..."
                      className="h-9 border-0 bg-transparent text-white font-semibold focus-visible:ring-0 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={minLPA || ''}
                      onChange={(e) => setMinLPA(Number(e.target.value) || 0)}
                    />
                    <span className="text-zinc-500 pr-4 text-sm font-medium">LPA</span>
                  </div>
                </div>
              </div>

              {/* Resume AI Match Card */}
              <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-zinc-100">AI Resume Match</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800 bg-zinc-900">Beta</Badge>
                  </div>
                  {!isAnalyzed ? (
                    <div className="flex flex-col gap-2">
                      <Textarea 
                        placeholder="Paste resume snippets here. We'll auto-extract your tech stack..."
                        className="resize-none flex-1 min-h-[72px] bg-zinc-950 border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl p-3"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                      />
                      {resumeText.trim().length > 0 && (
                        <Button 
                          size="sm" 
                          onClick={handleExtractSkills} 
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl h-8"
                        >
                          Extract Skills
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 flex-1 justify-center">
                      <div className="flex flex-wrap gap-2">
                        {extractedSkills.length === 0 ? (
                          <span className="text-xs text-zinc-500 italic">No exact matches found in dictionary.</span>
                        ) : null}
                        {extractedSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1.5 px-2 py-1 rounded-md">
                            <span className="capitalize">{skill}</span>
                            <button 
                              onClick={() => handleRemoveSkill(skill)} 
                              className="hover:text-white focus:outline-none bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-zinc-500">Searching jobs using these skills.</span>
                        <Button variant="ghost" size="sm" onClick={handleClearResume} className="h-6 px-2 text-[10px] text-zinc-400 hover:text-white">
                          Start Over
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <JobList
              jobs={jobs}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onJobClick={handleJobClick}
              loading={loading}
              resumeText={isAnalyzed ? extractedSkills.join(" ") : ""}
              minLPA={minLPA}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
