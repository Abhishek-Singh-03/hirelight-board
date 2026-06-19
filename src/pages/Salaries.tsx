import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, Building2, Briefcase, Plus, IndianRupee, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
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

    try {
      const res = await fetch(`${API}/salaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit");
      
      toast({ title: "Success!", description: "Salary data contributed anonymously." });
      setShowForm(false);
      setCompany(""); setRole(""); setYoe(""); setBase(""); setBonus(""); setStock("");
      fetchSalaries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit. Try again.", variant: "destructive" });
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header searchTerm="" onSearchChange={() => {}} onSearchSubmit={() => {}} />

      <main className="container mx-auto px-4 py-12 flex-1 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-3">
              <Banknote className="h-10 w-10 text-primary" /> Tech Salaries
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Real data, real insights. See what companies are actually paying.</p>
          </div>
          
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 font-semibold h-12 px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Plus className="h-5 w-5" /> Contribute Salary
          </Button>
        </div>

        {showForm && (
          <Card className="mb-10 border-2 border-primary/20 glass animate-in slide-in-from-top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Share Anonymously 🤫</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Company (e.g. Google)" value={company} onChange={e => setCompany(e.target.value)} required />
                <Input placeholder="Role (e.g. SDE 2)" value={role} onChange={e => setRole(e.target.value)} required />
                <Input type="number" placeholder="Years of Experience" value={yoe} onChange={e => setYoe(e.target.value ? Number(e.target.value) : "")} required min="0" />
                <Input type="number" placeholder="Base Salary (LPA)" value={base} onChange={e => setBase(e.target.value ? Number(e.target.value) : "")} required min="1" />
                <Input type="number" placeholder="Annual Bonus (LPA) - Optional" value={bonus} onChange={e => setBonus(e.target.value ? Number(e.target.value) : "")} min="0" />
                <Input type="number" placeholder="Stock/RSUs per year (LPA) - Optional" value={stock} onChange={e => setStock(e.target.value ? Number(e.target.value) : "")} min="0" />
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" className="font-bold">Submit Anonymously</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by company or role (e.g. Amazon, SDE 2)..." 
            className="pl-12 h-14 text-lg bg-background/50 backdrop-blur border-primary/20 rounded-2xl focus-visible:ring-primary shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {groupedData.length === 0 ? (
          <div className="text-center py-20 bg-background/30 rounded-3xl border border-dashed border-border/50">
            <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No salaries found</h3>
            <p className="text-muted-foreground">Be the first to share salary data for this search!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedData.map((data, idx) => (
              <Card key={idx} className="border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md glass bg-background/40">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> {data.company}
                      </CardTitle>
                      <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" /> {data.role}
                      </p>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                      {data.yoe} YOE
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-foreground flex items-center gap-1">
                      <IndianRupee className="h-7 w-7" /> {data.avgTotal}L <span className="text-sm font-normal text-muted-foreground ml-1">/ yr</span>
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Compensation</p>
                  </div>
                  
                  <div className="mt-6 space-y-2 text-sm bg-background/50 p-3 rounded-xl border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Salary</span>
                      <span className="font-semibold text-foreground">₹{data.avgBase}L</span>
                    </div>
                    {(data.avgBonus > 0 || data.avgStock > 0) && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bonus</span>
                          <span className="font-semibold text-foreground">₹{data.avgBonus}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock / RSUs</span>
                          <span className="font-semibold text-foreground">₹{data.avgStock}L</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 text-xs text-center text-muted-foreground opacity-60">
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
