import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";

type Mode = "login" | "register" | "forgot";

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultMode = (searchParams.get("mode") as Mode) || "login";

  const [mode, setMode] = useState<Mode>(defaultMode);
  const role = "CANDIDATE";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Post-register state: show verify banner
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [verifyLink, setVerifyLink] = useState("");

  // Post-forgot state: show reset link
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  // Unverified login state
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // Handle ?verified=true or ?verified=expired from redirect after email verify
  useEffect(() => {
    document.title = "Sign In | GoJobWise";
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast({ title: "Email Verified! ✅", description: "Your account is now active. Please sign in." });
    } else if (verified === "expired") {
      toast({ title: "Link Expired", description: "Your verification link has expired. Request a new one.", variant: "destructive" });
    }
    return () => { document.title = "GoJobWise — Find Your Next Tech Job"; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail("");

    if (mode === "forgot") {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setResetLink(data.resetLink || "");
        setForgotSuccess(true);
      } catch {
        toast({ title: "Connection Error", description: "Cannot reach the server.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const body = mode === "register"
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle unverified email on login
        if (res.status === 403 && data.unverified) {
          setUnverifiedEmail(data.email || email);
          return;
        }
        toast({ title: "Error", description: data.error || "Something went wrong.", variant: "destructive" });
        return;
      }

      // Register success — show verify banner
      if (mode === "register") {
        setVerifyLink(data.verifyLink || "");
        setRegisterSuccess(true);
        return;
      }

      login(data.token, data.name, data.role, data.userId);
      toast({ title: `Welcome, ${data.name}! 🎉`, description: `Logged in as ${data.role}.` });
      if (data.role === "RECRUITER") navigate("/talent");
      else navigate("/");
    } catch {
      toast({ title: "Connection Error", description: "Cannot reach the server. Is the backend running?", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      toast({ title: "Verification link sent!", description: "Use the link shown below." });
      if (data.verifyLink) setVerifyLink(data.verifyLink);
    } catch {
      toast({ title: "Error", description: "Could not resend. Try again.", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

  // ── Register success screen ───────────────────────────────────────────────
  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <Card className="border-2 border-primary/20 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] glass">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold">Account Created!</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your account is ready. Click the verification link below to activate it and start applying to jobs.
              </p>

              {verifyLink && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Verification Link</p>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-left">
                    <p className="text-xs text-primary break-all font-mono">{verifyLink}</p>
                  </div>
                  <Button
                    className="w-full font-bold"
                    onClick={() => window.open(verifyLink, "_blank")}
                  >
                    ✅ Verify My Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This link is valid for 24 hours.
                  </p>
                </div>
              )}

              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setRegisterSuccess(false); setMode("login"); }}>
                Already verified? Sign In →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Forgot password success screen ───────────────────────────────────────
  if (forgotSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <Card className="border-2 border-primary/20 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] glass">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Reset Link Generated</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use the link below to set a new password. This link is valid for <strong>1 hour</strong>.
              </p>

              {resetLink && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-left">
                    <p className="text-xs text-primary break-all font-mono">{resetLink}</p>
                  </div>
                  <Button
                    className="w-full font-bold"
                    onClick={() => {
                      const url = new URL(resetLink);
                      navigate(`/reset-password?token=${url.searchParams.get("token")}`);
                    }}
                  >
                    🔑 Reset My Password
                  </Button>
                </div>
              )}

              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setForgotSuccess(false); setMode("login"); }}>
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>

        <Card className="border-2 border-primary/20 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] glass">
          <CardContent className="p-8 space-y-6">

            {/* Logo + Title */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
                  <img src={logo} alt="GoJobWise" className="h-8 w-8 object-contain" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {mode === "login" ? "Welcome Back" : mode === "register" ? "Join GoJobWise" : "Reset Password"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "login"
                  ? "Sign in to access your dashboard and saved jobs."
                  : mode === "register"
                    ? "Create your account to start your journey."
                    : "Enter your email and we'll generate a reset link."}
              </p>
            </div>

            {/* Unverified email warning */}
            {unverifiedEmail && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-2">
                <p className="text-sm text-yellow-400 font-medium">📧 Email not verified</p>
                <p className="text-xs text-muted-foreground">
                  Please verify <strong>{unverifiedEmail}</strong> before logging in.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Mail className="h-3 w-3 mr-2" />}
                  {resendLoading ? "Sending..." : "Resend Verification Link"}
                </Button>
                {verifyLink && (
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-primary break-all font-mono">{verifyLink}</p>
                  </div>
                )}
              </div>
            )}

            {/* Login / Register Toggle (only for login/register modes) */}
            {mode !== "forgot" && (
              <div className="flex rounded-xl bg-secondary/30 p-1 border border-border">
                {(["login", "register"] as ("login" | "register")[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setUnverifiedEmail(""); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === m ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>
            )}

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

              {mode !== "forgot" && (
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
                  {/* Forgot Password link */}
                  {mode === "login" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setUnverifiedEmail(""); }}
                        className="text-xs text-primary/70 hover:text-primary hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Please wait...</>
                ) : (
                  mode === "login" ? "Sign In →" : mode === "register" ? "Create Account →" : "Generate Reset Link →"
                )}
              </Button>
            </form>

            {/* Switch mode link */}
            {mode === "forgot" ? (
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); setUnverifiedEmail(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
