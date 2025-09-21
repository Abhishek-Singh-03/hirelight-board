import { useState, useEffect } from "react";
import { Bell, Star, Zap, Trophy, Clock, MapPin } from "lucide-react";

const ScrollingBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerItems = [
    {
      icon: Zap,
      text: "🔥 500+ New Jobs Added This Week!",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
    },
    {
      icon: Star,
      text: "⭐ Top Companies are Hiring - Apply Now!",
      color: "from-blue-400 to-purple-500",
      bgColor: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
    },
    {
      icon: Trophy,
      text: "🏆 Premium Jobs with 20+ LPA Salary!",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
      icon: MapPin,
      text: "🌍 Remote Work Opportunities Available!",
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20"
    },
    {
      icon: Clock,
      text: "⚡ Fresh Internships Posted Today!",
      color: "from-cyan-400 to-teal-500",
      bgColor: "bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerItems.length]);

  const currentItem = bannerItems[currentIndex];
  const IconComponent = currentItem.icon;

  return (
    <div className="relative overflow-hidden border-b border-border/50 shadow-lg shadow-primary/5">
      {/* Background with gradient */}
      <div className={`${currentItem.bgColor} transition-all duration-700 ease-in-out`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite]"></div>
        
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            {/* Animated Icon */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentItem.color} rounded-full blur-sm opacity-50 animate-pulse`}></div>
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${currentItem.color} shadow-lg transform hover:scale-110 transition-transform duration-200`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Scrolling Text */}
            <div className="relative overflow-hidden">
              <div 
                key={currentIndex}
                className="animate-fade-in font-semibold text-sm md:text-base bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
              >
                {currentItem.text}
              </div>
            </div>

            {/* Bell Icon with Animation */}
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground animate-[wiggle_1s_ease-in-out_infinite] hover:text-primary transition-colors duration-200" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-2 space-x-1">
            {bannerItems.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? `w-6 bg-gradient-to-r ${currentItem.color}` 
                    : 'w-1 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingBanner;