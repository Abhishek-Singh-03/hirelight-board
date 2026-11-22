import { Search, TrendingUp, Users, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  totalJobs: number;
  loading: boolean;
}

export function HeroSection({ searchTerm, onSearchChange, onSearchSubmit, totalJobs, loading }: HeroSectionProps) {
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
    <section className="relative py-12 md:py-20 px-4 pt-16 md:pt-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
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

          {/* Search Section — hidden on mobile since the header already has a search bar */}
          <div className="hidden md:block max-w-2xl mx-auto">
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

          {/* Stats — always 3 columns so they never stack and take the full viewport */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto pt-6 md:pt-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-3 md:p-6 text-center border-0 shadow-md">
                <CardContent className="p-0 space-y-1 md:space-y-2">
                  <stat.icon className="h-5 w-5 md:h-8 md:w-8 mx-auto text-primary" />
                  <div className="text-lg md:text-2xl font-bold">
                    {loading && stat.label === "Active Jobs" ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto inline-block" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}