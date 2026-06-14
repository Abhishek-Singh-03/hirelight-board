import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";

type Stage = "form" | "success";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("form");

  useEffect(() => {
    document.title = "Reset Password | HireLight";
    return () => { document.title = "HireLight — Find Your Next Tech Job"; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter your password.", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Invalid link", description: "This reset link is missing a token.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Reset failed.", variant: "destructive" });
        return;
      }
      setStage("success");
    } catch {
      toast({ title: "Connection Error", description: "Cannot reach the server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="border-2 border-primary/20 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] glass">
          <CardContent className="p-8 space-y-6">

            {/* Logo */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
                  {stage === "success"
                    ? <CheckCircle2 className="h-8 w-8 text-green-400" />
                    : <KeyRound className="h-7 w-7 text-primary" />
                  }
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {stage === "success" ? "Password Updated!" : "Set New Password"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {stage === "success"
                  ? "Your password has been changed. You can now sign in."
                  : "Enter your new password below."}
              </p>
            </div>

            {stage === "success" ? (
              <Button
                className="w-full h-11 font-bold"
                onClick={() => navigate("/auth?mode=login")}
              >
                Sign In →
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!token && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                    ⚠️ This reset link is invalid or expired.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="border-border/60 focus:border-primary/50 rounded-xl"
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs text-destructive">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full h-11 font-bold shadow-lg shadow-primary/20"
                >
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</> : "Update Password →"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth?mode=login")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
