import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, Building2, Briefcase, Plus, IndianRupee, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";

interface Salary {
  id: number;
  company: string;
  role: string;
  yoe: number;
  baseSalary: number;
  bonus: number;
  stock: number;
  date: string;
}

const API = API_BASE_URL;

export default function Salaries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  usePageSEO({
    title: "Tech Salaries in India | GoJobWise",
    description: "Anonymous salary data for tech roles in India. See real base salary, bonus and stock data for SDE, product managers and more at top tech companies.",
  });

  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [yoe, setYoe] = useState<number | "">("");
  const [base, setBase] = useState<number | "">("");
  const [bonus, setBonus] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = () => {
    fetch(`${API}/salaries`)
      .then(res => res.json())
      .then(data => setSalaries(data))
      .catch(err => console.error("Failed to load salaries", err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || base === "" || yoe === "") {
      toast({ title: "Error", description: "Company, Role, YOE, and Base Salary are required.", variant: "destructive" });
      return;
    }

    const payload = {
      company,
      role,
      yoe: Number(yoe),
      baseSalary: Number(base),
      bonus: Number(bonus) || 0,
      stock: Number(stock) || 0
    };

    if (!user) {
      toast({ title: "Sign in Required", description: "Please log in to contribute a salary.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    try {
      const res = await fetch(`${API}/salaries`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        try {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to submit.");
        } catch (e: any) {
          throw new Error(e.message === "Failed to submit." ? e.message : "An unexpected server error occurred. Please try again later.");
        }
      }
      
      toast({ title: "Success!", description: "Salary data contributed anonymously." });
      setShowForm(false);
      setCompany(""); setRole(""); setYoe(""); setBase(""); setBonus(""); setStock("");
      fetchSalaries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit. Try again.", variant: "destructive" });
    }
  };

  // Group and average salaries by Company & Role
  const groupedData = useMemo(() => {
    const filtered = salaries.filter(s => 
      s.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, curr) => {
      const key = `${curr.company}::${curr.role}::${curr.yoe}`;
      if (!acc[key]) {
        acc[key] = { company: curr.company, role: curr.role, yoe: curr.yoe, count: 0, totalBase: 0, totalBonus: 0, totalStock: 0 };
      }
      acc[key].count += 1;
      acc[key].totalBase += curr.baseSalary;
      acc[key].totalBonus += curr.bonus;
      acc[key].totalStock += curr.stock;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map(g => ({
      company: g.company,
      role: g.role,
      yoe: g.yoe,
      samples: g.count,
      avgBase: Math.round(g.totalBase / g.count),
      avgBonus: Math.round(g.totalBonus / g.count),
      avgStock: Math.round(g.totalStock / g.count),
      avgTotal: Math.round((g.totalBase + g.totalBonus + g.totalStock) / g.count)
    })).sort((a, b) => b.avgTotal - a.avgTotal); // Sort highest CTC first
  }, [salaries, searchTerm]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden w-full relative">
      {/* Animated Glowing Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="relative z-10 w-full">
        <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12 flex-1 w-full max-w-6xl min-w-0 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-6 w-full">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-3">
              <Banknote className="h-10 w-10 text-primary" /> Tech Salaries
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Real data, real insights. See what companies are actually paying.
              <br/>
              {user ? "Your submission is 100% anonymous." : "Sign in to share your salary anonymously."}
            </p>
          </div>
          
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 font-semibold h-12 px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-full md:w-auto">
            <Plus className="h-5 w-5" /> Contribute Salary
          </Button>
        </div>

        {showForm && (
          <Card className="mb-10 border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-emerald-500" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">Share Anonymously <span className="text-xl">🤫</span></CardTitle>
              <p className="text-zinc-400 text-sm">Your data will be aggregated to help others. No personally identifiable information is stored.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Company</label>
                    <Input placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} required className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role</label>
                    <Input placeholder="e.g. SDE 2" value={role} onChange={e => setRole(e.target.value)} required className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Years of Experience</label>
                    <Input type="number" placeholder="e.g. 3" value={yoe} onChange={e => setYoe(e.target.value ? Number(e.target.value) : "")} required min="0" className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Base Salary (LPA)</label>
                    <Input type="number" placeholder="e.g. 24" value={base} onChange={e => setBase(e.target.value ? Number(e.target.value) : "")} required min="1" className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-emerald-500/10 focus:border-emerald-500/50 transition-all rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Annual Bonus (LPA)</label>
                    <Input type="number" placeholder="Optional" value={bonus} onChange={e => setBonus(e.target.value ? Number(e.target.value) : "")} min="0" className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stock / RSUs (LPA)</label>
                    <Input type="number" placeholder="Optional" value={stock} onChange={e => setStock(e.target.value ? Number(e.target.value) : "")} min="0" className="h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all rounded-xl" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="rounded-xl h-11 hover:bg-red-500/10 hover:text-red-500 transition-colors">Cancel</Button>
                  <Button type="submit" className="rounded-xl h-11 px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_-3px_var(--primary)] hover:shadow-[0_0_25px_0_var(--primary)] transition-all">Submit Anonymously</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-10 w-full max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-emerald-500/20 blur-xl opacity-50 rounded-full" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by company or role (e.g. Google, SDE)..." 
              className="w-full pl-14 pr-6 h-16 text-sm md:text-lg bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full focus-visible:ring-primary shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {groupedData.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-dashed border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Banknote className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-white">No salaries found</h3>
            <p className="text-muted-foreground">Be the first to share salary data for this search!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedData.map((data, idx) => (
              <Card key={idx} className="relative overflow-hidden group bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_48px_rgba(124,58,237,0.15)]">
                {/* Subtle top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-white group-hover:text-primary transition-colors">
                        <Building2 className="h-5 w-5 opacity-70" /> {data.company}
                      </CardTitle>
                      <p className="text-sm font-medium text-zinc-400 mt-1.5 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 opacity-70" /> {data.role}
                      </p>
                    </div>
                    <div className="bg-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold border border-white/10 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                      {data.yoe} YOE
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm text-emerald-400/80 uppercase tracking-wider font-semibold mb-1">Total CTC</p>
                    <p className="text-4xl font-black text-white flex items-baseline gap-1">
                      <IndianRupee className="h-6 w-6 text-emerald-400/80" strokeWidth={3} /> {data.avgTotal}L
                      <span className="text-sm font-semibold text-zinc-500 ml-1">/yr</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2.5 text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Base Salary</span>
                      <span className="font-bold text-white">₹{data.avgBase}L</span>
                    </div>
                    {(data.avgBonus > 0 || data.avgStock > 0) && (
                      <>
                        <div className="w-full h-px bg-white/5 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Bonus</span>
                          <span className="font-semibold text-zinc-200">₹{data.avgBonus}L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Stock / RSUs</span>
                          <span className="font-semibold text-zinc-200">₹{data.avgStock}L</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-5 text-xs text-center font-medium text-zinc-500">
                    Based on {data.samples} anonymously submitted {data.samples === 1 ? 'profile' : 'profiles'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
