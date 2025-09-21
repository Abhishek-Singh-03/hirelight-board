import { Search, TrendingUp, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  totalJobs: number;
}

export function HeroSection({ searchTerm, onSearchChange, onSearchSubmit, totalJobs }: HeroSectionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  const stats = [
    { icon: TrendingUp, label: "Active Jobs", value: totalJobs.toLocaleString() },
    { icon: Users, label: "Companies", value: "500+" },
    { icon: MapPin, label: "Locations", value: "50+" },
  ];

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto text-center relative">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of job opportunities from top companies. Start your career journey with JobWise.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  onClick={onSearchSubmit}
                  size="lg"
                  className="h-12 md:px-8 w-full md:w-auto"
                >
                  Search Jobs
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center border-0 shadow-md">
                <CardContent className="p-0 space-y-2">
                  <stat.icon className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Banner Ad Placeholder */}
          <div className="pt-8">
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="p-8 text-center">
                <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
                <div className="h-24 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Top Banner Ad Space (728x90)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}