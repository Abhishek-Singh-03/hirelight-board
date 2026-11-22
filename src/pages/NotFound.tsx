import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="text-8xl font-extrabold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">404</div>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            🏠 Go Home
          </a>
          <a href="/#jobs" className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors">
            💼 Browse Jobs
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
