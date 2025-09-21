import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 relative overflow-hidden hover:bg-primary/10 transition-all duration-300"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={`h-4 w-4 absolute transition-all duration-500 ease-in-out ${
            theme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`h-4 w-4 absolute transition-all duration-500 ease-in-out ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>
      
      {/* Tooltip-like text on hover */}
      <span className="sr-only">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </span>
    </Button>
  );
};

export default ThemeToggle;