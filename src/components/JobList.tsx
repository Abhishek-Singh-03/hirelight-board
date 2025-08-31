import { useState, useEffect } from "react";
import { JobCard, Job } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface JobListProps {
  searchTerm: string;
  selectedCategory: string;
  onJobClick: (job: Job) => void;
}

export function JobList({ searchTerm, selectedCategory, onJobClick }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedJobs, setDisplayedJobs] = useState(6);

  // Mock data for demonstration
  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior React Developer",
      company: "TechCorp Solutions",
      location: "Bangalore, India",
      applyLink: "https://example.com/apply/1",
      postedOn: "2025-08-30",
      category: "remote",
      description: "Looking for an experienced React developer to join our dynamic team. Work on cutting-edge projects with modern technologies.",
      salary: "₹15-25 LPA",
      type: "Full-time"
    },
    {
      id: "2",
      title: "Software Engineer - Fresher",
      company: "Infosys Limited",
      location: "Hyderabad, India",
      applyLink: "https://example.com/apply/2",
      postedOn: "2025-08-29",
      category: "fresher",
      description: "Entry-level position for recent graduates. Comprehensive training program and mentorship provided.",
      salary: "₹3.5-5 LPA",
      type: "Full-time"
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "Microsoft India",
      location: "Chennai, India",
      applyLink: "https://example.com/apply/3",
      postedOn: "2025-08-28",
      category: "remote",
      description: "Join our AI/ML team to work on innovative data science projects. Remote work available.",
      salary: "₹20-35 LPA",
      type: "Full-time"
    },
    {
      id: "4",
      title: "Junior Developer Trainee",
      company: "Wipro Technologies",
      location: "Pune, India",
      applyLink: "https://example.com/apply/4",
      postedOn: "2025-08-27",
      category: "fresher",
      description: "12-month trainee program for fresh graduates. Learn from industry experts.",
      salary: "₹3-4 LPA",
      type: "Trainee"
    },
    {
      id: "5",
      title: "Government Officer - Grade A",
      company: "Government of India",
      location: "New Delhi, India",
      applyLink: "https://example.com/apply/5",
      postedOn: "2025-08-26",
      category: "government",
      description: "Administrative position in central government. Excellent benefits and job security.",
      salary: "₹50,000-80,000/month",
      type: "Government"
    },
    {
      id: "6",
      title: "Full Stack Developer",
      company: "Startup Inc",
      location: "Mumbai, India",
      applyLink: "https://example.com/apply/6",
      postedOn: "2025-08-25",
      category: "remote",
      description: "Build scalable web applications using modern tech stack. Flexible work arrangements.",
      salary: "₹8-15 LPA",
      type: "Full-time"
    },
    {
      id: "7",
      title: "Banking Associate - Fresher",
      company: "HDFC Bank",
      location: "Kolkata, India",
      applyLink: "https://example.com/apply/7",
      postedOn: "2025-08-24",
      category: "fresher",
      description: "Entry-level banking position with growth opportunities. Training provided.",
      salary: "₹2.5-3.5 LPA",
      type: "Full-time"
    },
    {
      id: "8",
      title: "Forest Officer",
      company: "Forest Department",
      location: "Kerala, India",
      applyLink: "https://example.com/apply/8",
      postedOn: "2025-08-23",
      category: "government",
      description: "Protect and manage forest resources. Outdoor work with environmental impact.",
      salary: "₹45,000-70,000/month",
      type: "Government"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation, this would be:
        // const response = await fetch('https://opensheet.elk.sh/YOUR_SPREADSHEET_ID/Sheet1');
        // const data = await response.json();
        
        setJobs(mockJobs);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const jobsToShow = filteredJobs.slice(0, displayedJobs);

  const loadMore = () => {
    setDisplayedJobs(prev => Math.min(prev + 6, filteredJobs.length));
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
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
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
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
        </h2>
        <div className="text-sm text-muted-foreground">
          Showing {jobsToShow.length} of {filteredJobs.length}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid gap-6">
        {jobsToShow.map((job, index) => (
          <div key={job.id}>
            <JobCard job={job} onClick={() => onJobClick(job)} />
            {/* Ad placement every 3 jobs */}
            {(index + 1) % 3 === 0 && index < jobsToShow.length - 1 && (
              <Card className="mt-6 bg-muted/30 border-dashed border-2">
                <CardContent className="p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
                  <div className="h-20 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Inline Ad Space (468x60)</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {displayedJobs < filteredJobs.length && (
        <div className="text-center pt-6">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Jobs ({filteredJobs.length - displayedJobs} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}