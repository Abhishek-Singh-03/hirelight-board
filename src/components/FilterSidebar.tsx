import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Building2, Code, Briefcase, GraduationCap, Users, DollarSign } from "lucide-react";
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
}

export function FilterSidebar({ selectedCategory, onCategoryChange, jobStats }: FilterSidebarProps) {
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

      {/* Job Type Filter */}
      <Card className="border-2 border-secondary/10 shadow-lg shadow-secondary/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Job Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedJobTypes.includes(type.id)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(type.id, checked as boolean, setSelectedJobTypes)
                }
              />
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {type.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Salary Range Filter */}
      <Card className="border-2 border-accent/10 shadow-lg shadow-accent/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Salary Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {salaryRanges.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <Checkbox
                id={range.id}
                checked={selectedSalaryRange.includes(range.id)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(range.id, checked as boolean, setSelectedSalaryRange)
                }
              />
              <label
                htmlFor={range.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {range.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience Level Filter */}
      <Card className="border-2 border-warning/10 shadow-lg shadow-warning/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Experience Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {experienceLevels.map((level) => (
            <div key={level.id} className="flex items-center space-x-2">
              <Checkbox
                id={level.id}
                checked={selectedExperience.includes(level.id)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(level.id, checked as boolean, setSelectedExperience)
                }
              />
              <label
                htmlFor={level.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {level.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ad Placeholder */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-dashed border-2">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Advertisement</div>
            <div className="h-32 bg-muted/50 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Ad Space 300x250</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}