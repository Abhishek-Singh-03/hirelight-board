"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, ExternalLink, Share2, Twitter, Facebook, Linkedin, Link } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0], [-6, 0]); // only tilt left
  const applyOpacity = useTransform(x, [-120, -40], [1, 0]); // hint appears when dragging left
  const [isDragging, setIsDragging] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.applyLink, "_blank");
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(job.applyLink);
      toast({
        title: "Link copied!",
        description: "Job link has been copied to clipboard.",
      });
      setShowShareMenu(false);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out this job: ${job.title} at ${job.company}`;
    const url = job.applyLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Recently posted";
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "remote":
        return "bg-success text-success-foreground";
      case "fresher":
        return "bg-primary text-primary-foreground";
      case "government":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -250, right: 0 }} // ❌ no right drag allowed
      dragElastic={0.12}
      style={{ x, rotate }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const offsetX = info.offset.x;
        const velocityX = info.velocity.x;
        const offsetThreshold = 120;
        const velocityThreshold = 500;

        // LEFT swipe → open apply link
        const isLeftSwipe = offsetX < -offsetThreshold || velocityX < -velocityThreshold;

        if (isLeftSwipe) {
          controls
            .start({ x: -1000, opacity: 0, transition: { duration: 0.35 } })
            .then(() => {
              window.open(job.applyLink, "_blank");
              controls.set({ x: 0, opacity: 1 }); // reset for reuse
            });
        } else {
          // Snap back
          controls.start({ x: 0, transition: { type: "spring", stiffness: 350, damping: 30 } });
        }
      }}
      animate={controls}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className="group transition-all duration-200 hover:shadow-lg hover:bg-job-card-hover border-border/50"
        onClick={!isDragging ? onClick : undefined}
      >
        <CardContent className="p-6 relative">
          {/* hint when dragging left */}
          <motion.span
            style={{ opacity: applyOpacity }}
            className="absolute right-4 top-4 text-xs font-semibold px-2 py-1 rounded-md bg-green-50 text-green-700 pointer-events-none"
          >
            ← Release to Apply
          </motion.span>

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
              {job.category && <Badge className={getCategoryColor(job.category)}>{job.category}</Badge>}
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
            <div className="flex items-center space-x-2">
              {job.category && (
                <Badge className={getCategoryColor(job.category)}>
                  {job.category}
                </Badge>
              )}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  onClick={handleShareClick}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg z-10 p-2 min-w-[150px]">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8"
                        onClick={handleSocialShare('twitter')}
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8"
                        onClick={handleSocialShare('linkedin')}
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8"
                        onClick={handleSocialShare('facebook')}
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8"
                        onClick={handleCopyLink}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Description Preview */}
            {job.description && <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>}

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
        </CardContent>
      </Card>
    </motion.div>
  );
}
