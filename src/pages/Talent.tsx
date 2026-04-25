import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, MapPin, Briefcase, Star, Mail, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Mock Data for Phase 1 Demo
const mockCandidates = [
  {
    id: "1",
    name: "Alex Johnson",
    role: "Senior React Developer",
    location: "Bangalore (Open to Remote)",
    experience: "4 Years",
    skills: ["React", "TypeScript", "Node.js", "Tailwind"],
    isPublic: true,
    bio: "Passionate frontend developer with a focus on building performant, accessible, and beautiful user interfaces.",
    matchScore: 94
  },
  {
    id: "2",
    name: "Sarah Williams",
    role: "Full Stack Engineer",
    location: "Remote",
    experience: "2 Years",
    skills: ["Next.js", "Python", "PostgreSQL", "AWS"],
    isPublic: true,
    bio: "Self-taught developer transitioning from data science. I love building APIs and robust backend systems.",
    matchScore: 88
  },
  {
    id: "3",
    name: "Hidden Profile",
    role: "UI/UX Designer",
    location: "Unknown",
    experience: "5+ Years",
    skills: ["Figma", "Framer", "CSS", "User Research"],
    isPublic: false,
    bio: "This candidate has set their profile to private. You must have a direct link to view their full details.",
    matchScore: 0
  },
  {
    id: "4",
    name: "Rahul Verma",
    role: "Frontend Fresher",
    location: "Pune",
    experience: "Fresher",
    skills: ["HTML", "CSS", "JavaScript", "React Basic"],
    isPublic: true,
    bio: "Recent bootcamp graduate looking for an opportunity to prove myself. Quick learner and hard worker.",
    matchScore: 72
  }
];

const Talent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = mockCandidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleContact = (name: string) => {
    toast({ title: "Message Request Sent", description: `We'll notify ${name} that you want to connect!` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchTerm={""}
        onSearchChange={() => {}}
        onSearchSubmit={() => {}}
      />

      <main className="container mx-auto px-4 py-12 flex-1">
        {/* Recruiter Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-4 py-1 text-sm">
            Recruiter Portal Demo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Discover Top <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Talent</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Search our curated pool of candidates who are actively looking for their next big role.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by role, skill (e.g. React), or name..."
            className="pl-12 h-14 text-lg rounded-2xl glass border-primary/20 focus-visible:ring-primary shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="relative overflow-hidden glass hover:-translate-y-1 transition-transform duration-300">
              
              {/* Blur for Private Profiles */}
              {!candidate.isPublic && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center p-8 text-center border border-border">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Private Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This candidate has disabled public discovery. 
                  </p>
                  <Button variant="outline" disabled className="mt-4">Locked</Button>
                </div>
              )}

              {/* Card Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
              
              <CardContent className="p-6 relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{candidate.name}</h3>
                      <p className="text-primary text-sm font-medium">{candidate.role}</p>
                    </div>
                  </div>
                  {candidate.matchScore > 85 && (
                    <Badge className="bg-success text-success-foreground shrink-0 shadow-[0_0_10px_-2px_var(--success)]">
                      Top Match 🔥
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs text-muted-foreground gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {candidate.experience}
                  </span>
                </div>

                <p className="text-sm line-clamp-2 text-muted-foreground min-h-[40px]">
                  {candidate.bio}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {candidate.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-secondary bg-opacity-50 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{candidate.skills.length - 3}</Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
                    onClick={() => handleContact(candidate.name)}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Message
                  </Button>
                  <Button variant="outline" className="border-border hover:bg-secondary/20 group">
                    <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Talent;
