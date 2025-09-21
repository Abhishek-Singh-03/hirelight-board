import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { Footer } from "@/components/Footer";
import ScrollingBanner from "@/components/ScrollingBanner";
import { Job } from "@/components/JobCard";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://opensheet.elk.sh/1s1a2XpHEmQnIATVQwK2VXszUPwAh306GWtkYbkBfFOY/Sheet1"
        );
        const data = await response.json();

        const formattedJobs: Job[] = data.map((row: any, index: number) => ({
          id: String(index + 1),
          title: row.Title || "Untitled Job",
          company: row.Company || "Unknown Company",
          location: row.Location || "N/A",
          applyLink: row.ApplyLink || "#",
          postedOn: row.PostedOn || "",
          category: row.Category?.toLowerCase() || "other",
          description: row.Description || "No description provided.",
          salary: row.Salary || "Not specified",
          type: row.Type || "Full-time"
        }));

        // Sort latest first
        formattedJobs.sort((a, b) => {
          const dateA = dayjs(a.postedOn, "DD/MM/YYYY HH:mm");
          const dateB = dayjs(b.postedOn, "DD/MM/YYYY HH:mm");
          return dateB.valueOf() - dateA.valueOf();
        });

        setJobs(formattedJobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearchSubmit = () => {
    console.log("Searching for:", searchTerm);
  };

  const handleJobClick = (job: Job) => {
    console.log("Job clicked:", job);
    window.open(job.applyLink, "_blank");
  };

  // ✅ Compute stats dynamically
  const jobStats = {
    total: jobs.length,
    remote: jobs.filter((job) => job.location.toLowerCase().includes("remote")).length,
    fresher: jobs.filter((job) => job.category === "fresher").length,
    government: jobs.filter((job) => job.category === "government").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />

      <ScrollingBanner />

      <HeroSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        totalJobs={jobStats.total}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              jobStats={jobStats}
            />
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <JobList
              jobs={jobs} // ✅ pass jobs instead of fetching inside JobList
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onJobClick={handleJobClick}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
