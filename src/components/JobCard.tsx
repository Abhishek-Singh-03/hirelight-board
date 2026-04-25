"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, ExternalLink, Share2, Twitter, Facebook, Linkedin, Link, FileText } from "lucide-react";
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
  matchScore?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isLocked?: boolean;
}

export function JobCard({ job, onClick, matchScore, onSwipeLeft, onSwipeRight, isLocked }: JobCardProps) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-6, 0, 6]); // tilt left and right
  const applyOpacity = useTransform(x, [-120, -40], [1, 0]); // hint appears when dragging left
  const saveOpacity = useTransform(x, [40, 120], [0, 1]); // hint appears when dragging right
  const [isDragging, setIsDragging] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.applyLink, "_blank");
  };

  const generateCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Dear Hiring Manager at ${job.company},

I am writing to express my strong interest in the ${job.title} position. 
Given my background and passion for your industry, I am confident in my ability to contribute effectively to your team.

I have reviewed the requirements, including:
"${job.description ? job.description.substring(0, 150).trim() + "..." : "Your core technical requirements."}"

I would welcome the opportunity to discuss how my skills align with your needs in an interview. 

Thank you for your time and consideration.

Best regards,
[Your Name Here]`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${job.company.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Cover Letter Created!", description: "Cover letter downloaded as a text file." });
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
      dragConstraints={{ left: -250, right: 250 }} 
      dragElastic={0.12}
      style={{ x, rotate }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const offsetX = info.offset.x;
        const velocityX = info.velocity.x;
        const offsetThreshold = 120;
        const velocityThreshold = 500;

        // LEFT swipe → skip / pass
        const isLeftSwipe = offsetX < -offsetThreshold || velocityX < -velocityThreshold;
        // RIGHT swipe → save
        const isRightSwipe = offsetX > offsetThreshold || velocityX > velocityThreshold;

        if (isLeftSwipe && onSwipeLeft) {
          controls.start({ x: -1000, opacity: 0, transition: { duration: 0.35 } }).then(() => {
            onSwipeLeft();
            controls.set({ x: 0, opacity: 1 });
          });
        } else if (isRightSwipe && onSwipeRight) {
          controls.start({ x: 1000, opacity: 0, transition: { duration: 0.35 } }).then(() => {
            onSwipeRight();
            controls.set({ x: 0, opacity: 1 });
          });
        }
        else if (isLeftSwipe && !onSwipeLeft) {
          // original generic behavior
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
      className="cursor-grab active:cursor-grabbing w-full"
    >
      <Card
        className={`group relative overflow-hidden glass glass-hover transition-all duration-500 rounded-2xl ${isLocked ? 'blur-[4px] grayscale select-none opacity-80 pointer-events-none' : ''}`}
        onClick={!isDragging && !isLocked ? onClick : undefined}
      >
        {isLocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px]">
            <div className="text-4xl mb-2">🔒</div>
            <div className="font-bold text-destructive px-3 py-1 bg-destructive/10 rounded-lg">Below Minimum Worth</div>
          </div>
        )}

        {/* Neon Glow background decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/40 transition-all duration-500" />
        
        <CardContent className="p-6 relative z-10 w-full h-full">
          {/* hint when dragging left */}
          <motion.span
            style={{ opacity: applyOpacity }}
            className="absolute right-4 top-4 text-xs font-semibold px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 pointer-events-none z-20"
          >
            ← Pass
          </motion.span>
          <motion.span
            style={{ opacity: saveOpacity }}
            className="absolute left-4 top-4 text-xs font-semibold px-2 py-1 rounded-md bg-success/10 text-success border border-success/20 pointer-events-none z-20"
          >
            Save →
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
              <div className="flex flex-col items-end gap-2">
                {job.category && <Badge className={getCategoryColor(job.category)}>{job.category}</Badge>}
                {matchScore !== undefined && (
                  <Badge variant={matchScore > 75 ? "default" : "secondary"} className={matchScore > 75 ? "bg-primary text-primary-foreground animate-pulse" : ""}>
                    {matchScore}% Match
                  </Badge>
                )}
              </div>
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
              {/* <div className="relative">
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
              </div> */}
            </div>
          </div>

            {/* Description Preview */}
            {job.description && <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>}

            {/* Actions: Apply and Save */}
            <div className="pt-4 flex gap-3">
              <Button
                onClick={handleApplyClick}
                className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-[0_0_15px_-3px_var(--primary)] hover:shadow-[0_0_20px_0px_var(--primary)]"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Quick Apply
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // Simple localStorage save
                  const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
                  if(!saved.find((s: Job) => s.id === job.id)) {
                    saved.push(job);
                    localStorage.setItem('savedJobs', JSON.stringify(saved));
                    toast({title: "Job Saved!", description: "Added to your tracker board."});

                    // Hustle Streak Logic
                    const today = new Date().toDateString();
                    const streakData = JSON.parse(localStorage.getItem('hustleStreak') || '{"count": 0, "lastDate": ""}');
                    if (streakData.lastDate !== today) {
                       const yesterday = new Date(Date.now() - 86400000).toDateString();
                       const isConsecutive = streakData.lastDate === yesterday;
                       streakData.count = isConsecutive ? streakData.count + 1 : 1;
                       streakData.lastDate = today;
                       localStorage.setItem('hustleStreak', JSON.stringify(streakData));
                       window.dispatchEvent(new Event('hustle-streak-updated'));
                    }
                  } else {
                    toast({title: "Already Saved", description: "This job is already in your tracker."});
                  }
                }}
                className="bg-secondary hover:bg-white/10 transition-all border border-white/5"
                variant="outline"
              >
                <Badge className="mr-2 bg-white/10 hover:bg-white/20 text-foreground">Track</Badge> 
                📌
              </Button>

              <Button
                onClick={generateCoverLetter}
                className="bg-secondary hover:bg-primary/20 text-primary transition-all border border-primary/20"
                variant="outline"
                size="icon"
                title="Generate Cover Letter"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
