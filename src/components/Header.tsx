import { Search, Menu, X, LogIn, LogOut, User, Home, Briefcase, CircleDollarSign, BookOpen, LayoutDashboard, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function Header({ searchTerm, onSearchChange, onSearchSubmit }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const { user, logout, isAuthenticated, isRecruiter } = useAuth();

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
    { name: 'Home', href: '/', icon: Home, show: true },
    { name: 'Jobs', href: '/#jobs', icon: Briefcase, show: !isRecruiter },
    { name: 'Salaries', href: '/salaries', icon: CircleDollarSign, show: true },
    { name: 'Blog', href: '/blog', icon: BookOpen, show: true },
    { name: 'My Board', href: '/dashboard', icon: LayoutDashboard, show: isAuthenticated && !isRecruiter },
    { name: 'Find Talent', href: '/talent', icon: Building2, show: isAuthenticated && isRecruiter },
    { name: 'Community', href: '/community', icon: MessageSquare, show: true },
  ].filter(item => item.show);

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
          <div className="hidden md:flex flex-1 max-w-[140px] lg:max-w-[240px] xl:max-w-md mx-2 xl:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 border-2 border-border/50 focus:border-primary/50 shadow-md shadow-primary/5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2 xl:space-x-4">
            <nav className="flex items-center space-x-1 xl:space-x-6">
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
                  className="flex items-center gap-1.5 text-xs xl:text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-primary transition-all duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left px-2 xl:px-3 py-2 rounded-lg hover:bg-primary/5"
                >
                  <item.icon className="h-4 w-4" />
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

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1 xl:gap-2">
                <div className="flex items-center gap-1.5 px-2 xl:px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs xl:text-sm font-semibold max-w-[100px] xl:max-w-full">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.name}</span>
                  <span className="text-[10px] opacity-60 font-normal hidden xl:inline">({user?.role})</span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 xl:px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={logout}>
                  <LogOut className="h-4 w-4" /> <span className="hidden xl:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20 shrink-0" onClick={() => window.location.href = '/auth'}>
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            )}


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
                  className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 px-4 py-3 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </a>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="border-t border-border/50 pt-4 mt-2">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                      <User className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{user?.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">({user?.role})</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive text-sm" 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full gap-2 shadow-md shadow-primary/20" 
                    onClick={() => {
                      window.location.href = '/auth';
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                )}
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