import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

// Protected route - redirects to login if not authenticated
function ProtectedRoute({ children, recruiterOnly = false }: { children: React.ReactNode; recruiterOnly?: boolean }) {
  const { isAuthenticated, isRecruiter } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (recruiterOnly && !isRecruiter) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/verify-email" element={<Auth />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/:shareCode" element={<Community />} />
      <Route path="/salaries" element={<Salaries />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* Hidden internal admin — no nav link, direct URL only */}
      <Route path="/admin" element={<Admin />} />

      {/* Protected: Only logged-in users */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      {/* Protected: Only Recruiters */}
      <Route path="/talent" element={
        <ProtectedRoute recruiterOnly><Talent /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
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
