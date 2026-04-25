import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function Header({ searchTerm, onSearchChange, onSearchSubmit }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadStreak = () => {
      const data = JSON.parse(localStorage.getItem('hustleStreak') || '{"count": 0, "lastDate": ""}');
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      // If last applied wasn't today or yesterday, streak is broken
      if (data.lastDate && data.lastDate !== today && data.lastDate !== yesterday) {
        setStreak(0);
      } else {
        setStreak(data.count || 0);
      }
    };
    loadStreak();
    window.addEventListener('hustle-streak-updated', loadStreak);
    return () => window.removeEventListener('hustle-streak-updated', loadStreak);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/#jobs' },
    { name: 'My Board 📌', href: '/dashboard' },
    { name: 'For Recruiters 🏢', href: '/talent' },
    { name: 'Community 💬', href: '/community' },
  ];

  const handleNavClick = (href: string) => {
    if (href === '/#jobs' && window.location.pathname === '/') {
      const jobsSection = document.getElementById('jobs');
      if (jobsSection) {
        jobsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg shadow-primary/25 transform hover:scale-105 transition-transform duration-200">
              <img src={logo} alt="JobWise Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">JobWise</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                placeholder="Search jobs by title or location..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 border-2 border-border/50 focus:border-primary/50 shadow-md shadow-primary/5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === '/#jobs' && window.location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left px-3 py-2 rounded-lg hover:bg-primary/5"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            
            {/* Hustle Streak gamification */}
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-xl font-bold font-mono shadow-[0_0_10px_-2px_var(--orange-500)] animate-pulse" title="Daily Hustle Streak">
                🔥 {streak}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden relative z-50 hover:bg-primary/10 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b shadow-xl shadow-primary/10 animate-fade-in">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === '/#jobs' && window.location.pathname === '/') {
                      e.preventDefault();
                      handleNavClick(item.href);
                      setIsMobileMenuOpen(false);
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 px-4 py-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10"
                >
                  {item.name}
                </a>
              ))}
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 border-2 border-border/50 focus:border-primary/50 shadow-md shadow-primary/5 rounded-xl transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}