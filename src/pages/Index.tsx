import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { Footer } from "@/components/Footer";
import { Job } from "@/components/JobCard";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearchSubmit = () => {
    // Search functionality is handled by JobList component
    console.log("Searching for:", searchTerm);
  };

  const handleJobClick = (job: Job) => {
    // For now, just open the apply link
    // In a real app, this would navigate to a job detail page
    console.log("Job clicked:", job);
    window.open(job.applyLink, '_blank');
  };

  // Mock stats for demo
  const jobStats = {
    total: 150,
    remote: 45,
    fresher: 60,
    government: 25,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />
      
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
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onJobClick={handleJobClick}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
