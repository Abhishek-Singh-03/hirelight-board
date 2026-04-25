import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Building2, Code, Briefcase, GraduationCap, Users, DollarSign, Sparkles } from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  jobStats: {
    total: number;
    remote: number;
    fresher: number;
    government: number;
  };
  resumeText?: string;
  onResumeChange?: (text: string) => void;
}

export function FilterSidebar({ selectedCategory, onCategoryChange, jobStats, resumeText, onResumeChange }: FilterSidebarProps) {
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'All Jobs', count: jobStats.total, icon: Building2 },
    { id: 'fresher', label: 'Fresher Jobs', count: jobStats.fresher, icon: GraduationCap },
    { id: 'remote', label: 'Remote Jobs', count: jobStats.remote, icon: MapPin },
    { id: 'government', label: 'Government Jobs', count: jobStats.government, icon: Building2 },
    { id: 'it', label: 'IT Jobs', count: Math.floor(jobStats.total * 0.4), icon: Code },
    { id: 'internship', label: 'Internships', count: Math.floor(jobStats.total * 0.15), icon: Users },
  ];

  const jobTypes = [
    { id: 'full-time', label: 'Full-time' },
    { id: 'part-time', label: 'Part-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'internship', label: 'Internship' },
  ];

  const salaryRanges = [
    { id: 'entry', label: 'Entry Level (2-5 LPA)' },
    { id: 'mid', label: 'Mid Level (5-10 LPA)' },
    { id: 'senior', label: 'Senior Level (10-20 LPA)' },
    { id: 'lead', label: 'Lead Level (20+ LPA)' },
  ];

  const experienceLevels = [
    { id: 'fresher', label: 'Fresher (0-1 years)' },
    { id: 'junior', label: 'Junior (1-3 years)' },
    { id: 'mid', label: 'Mid Level (3-5 years)' },
    { id: 'senior', label: 'Senior (5+ years)' },
  ];

  const handleCheckboxChange = (
    value: string,
    isChecked: boolean,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState(prev => 
      isChecked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card className="border-2 border-primary/10 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Job Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-between h-auto p-3 hover:bg-primary/5 transition-colors duration-200"
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="flex items-center space-x-2">
                <category.icon className="h-4 w-4" />
                <span className="text-sm">{category.label}</span>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {category.count}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* AI Resume Matcher */}
      {onResumeChange && (
        <Card className="border-2 border-primary/20 shadow-[0_0_15px_-5px_var(--primary)] bg-gradient-to-b from-card to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              Smart Resume Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Paste your resume text here. We'll instantly score jobs based on your skills!
            </p>
            <Textarea 
              placeholder="E.g., Experienced React developer with Node.js and TypeScript..."
              className="resize-none h-32 bg-background/50 border-primary/20 focus-visible:ring-primary"
              value={resumeText}
              onChange={(e) => onResumeChange(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

    </div>
  );
}