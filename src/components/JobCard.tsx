import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  applyLink: string;
  postedOn: string;
  category?: string;
  description?: string;
  salary?: string;
  type?: string;
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.applyLink, '_blank');
  };

  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently posted';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'remote':
        return 'bg-success text-success-foreground';
      case 'fresher':
        return 'bg-primary text-primary-foreground';
      case 'government':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-job-card-hover border-border/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">{job.company}</span>
              </div>
            </div>
            {job.category && (
              <Badge className={getCategoryColor(job.category)}>
                {job.category}
              </Badge>
            )}
          </div>

          {/* Location and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatPostedDate(job.postedOn)}</span>
            </div>
          </div>

          {/* Salary and Type */}
          {(job.salary || job.type) && (
            <div className="flex items-center space-x-3">
              {job.salary && (
                <Badge variant="outline" className="text-xs">
                  {job.salary}
                </Badge>
              )}
              {job.type && (
                <Badge variant="outline" className="text-xs">
                  {job.type}
                </Badge>
              )}
            </div>
          )}

          {/* Description Preview */}
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          )}

          {/* Apply Button */}
          <div className="pt-2">
            <Button 
              onClick={handleApplyClick}
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}