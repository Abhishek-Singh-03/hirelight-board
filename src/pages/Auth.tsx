import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

type Mode = "login" | "register";

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  // Role is always CANDIDATE on the public signup page
  const role = "CANDIDATE";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const body = mode === "register"
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Something went wrong.", variant: "destructive" });
        return;
      }

      login(data.token, data.name, data.role, data.userId);
      toast({ title: `Welcome, ${data.name}! 🎉`, description: `Logged in as ${data.role}.` });

      // Redirect based on role
      if (data.role === "RECRUITER") {
        navigate("/talent");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast({ title: "Connection Error", description: "Cannot reach the server. Is the backend running?", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow BG */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Back to Home */}
        <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>

        <Card className="border-2 border-primary/20 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] glass">
          <CardContent className="p-8 space-y-6">

            {/* Logo + Title */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
                  <img src={logo} alt="HireLight" className="h-8 w-8 object-contain" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {mode === "login" ? "Welcome Back" : "Join HireLight"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "login"
                  ? "Sign in to access your dashboard and saved jobs."
                  : "Create your account to start your journey."}
              </p>
            </div>

            {/* Login / Register Toggle */}
            <div className="flex rounded-xl bg-secondary/30 p-1 border border-border">
              {(["login", "register"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === m ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">


              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    id="auth-name"
                    placeholder="Abhishek Singh"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="border-border/60 focus:border-primary/50 rounded-xl"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="abhishek@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="border-border/60 focus:border-primary/50 rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-border/60 focus:border-primary/50 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Please wait...</>
                ) : (
                  mode === "login" ? "Sign In →" : "Create Account →"
                )}
              </Button>
            </form>

            {/* Switch mode link */}
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
