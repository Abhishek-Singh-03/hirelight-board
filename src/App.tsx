import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Talent from "./pages/Talent";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import Salaries from "./pages/Salaries";
import JobDetail from "./pages/JobDetail";
import ResetPassword from "./pages/ResetPassword";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { ParticleBackground } from "./components/ParticleBackground";
import { PageTransition } from "./components/PageTransition";

const queryClient = new QueryClient();

// Protected route - redirects to login if not authenticated
function ProtectedRoute({ children, recruiterOnly = false }: { children: React.ReactNode; recruiterOnly?: boolean }) {
  const { isAuthenticated, isRecruiter } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (recruiterOnly && !isRecruiter) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth/verify-email" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/community/:shareCode" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/salaries" element={<PageTransition><Salaries /></PageTransition>} />
        <Route path="/jobs/:id" element={<PageTransition><JobDetail /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />

        {/* Hidden internal admin — no nav link, direct URL only */}
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />

        {/* Protected: Only logged-in users */}
        <Route path="/dashboard" element={
          <ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>
        } />

        {/* Protected: Only Recruiters */}
        <Route path="/talent" element={
          <ProtectedRoute recruiterOnly><PageTransition><Talent /></PageTransition></ProtectedRoute>
        } />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange={true}>
      <TooltipProvider>
        <AuthProvider>
          <ParticleBackground />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
