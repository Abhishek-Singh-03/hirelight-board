import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Code, GraduationCap, MapPin, Users } from "lucide-react";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  locationFilter: string;
  onLocationChange: (loc: string) => void;
  jobTypesFilter: string[];
  onJobTypesChange: (types: string[]) => void;
  onClearAll: () => void;
  jobStats: {
    total: number;
    remote: number;
    fresher: number;
    government: number;
  };
}

export function FilterSidebar({ 
  selectedCategory, onCategoryChange, 
  locationFilter, onLocationChange,
  jobTypesFilter, onJobTypesChange,
  onClearAll,
  jobStats 
}: FilterSidebarProps) {
  const categories = [
    { id: 'all', label: 'All Jobs', count: jobStats.total, icon: Building2 },
    { id: 'fresher', label: 'Fresher Jobs', count: jobStats.fresher, icon: GraduationCap },
    { id: 'remote', label: 'Remote Jobs', count: jobStats.remote, icon: MapPin },
    { id: 'government', label: 'Government Jobs', count: jobStats.government, icon: Building2 },
    { id: 'it', label: 'IT Jobs', count: Math.floor(jobStats.total * 0.4), icon: Code },
    { id: 'internship', label: 'Internships', count: Math.floor(jobStats.total * 0.15), icon: Users },
  ];

  return (
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-700">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />
        
        <div className="relative z-10">
          
          {/* Master Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>
              </div>
              <h2 className="font-bold text-white text-base tracking-wide">Filters</h2>
            </div>
            <button onClick={onClearAll} className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Clear All</button>
          </div>

          {/* Categories Section */}
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <h3 className="font-semibold text-zinc-300 text-sm">Categories</h3>
          </div>
          <div className="space-y-1.5">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected 
                      ? "bg-primary/20 text-primary border border-primary/20 shadow-sm" 
                      : "text-zinc-400 border border-transparent hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <category.icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-zinc-500"}`} />
                    <span>{category.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${
                    isSelected 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-zinc-950 border-zinc-800 text-zinc-500"
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px w-full bg-zinc-800/80 my-6" />

          {/* Location Filter */}
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <h3 className="font-semibold text-zinc-300 text-sm">Location</h3>
          </div>
          <div className="px-2">
            <input 
              type="text" 
              placeholder="e.g. Bangalore, Remote" 
              className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              value={locationFilter}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
}