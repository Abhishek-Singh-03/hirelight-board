import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Building2 } from "lucide-react";

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
  const categories = [
    { id: 'all', label: 'All Jobs', count: jobStats.total, icon: Building2 },
    { id: 'fresher', label: 'Fresher Jobs', count: jobStats.fresher, icon: Calendar },
    { id: 'remote', label: 'Remote Jobs', count: jobStats.remote, icon: MapPin },
    { id: 'government', label: 'Government Jobs', count: jobStats.government, icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Job Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-between h-auto p-3"
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

      {/* Ad Placeholder */}
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Advertisement</div>
            <div className="h-32 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Ad Space 300x250</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}