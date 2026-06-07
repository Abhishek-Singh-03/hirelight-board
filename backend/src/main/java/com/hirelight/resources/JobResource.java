package com.hirelight.resources;

import com.hirelight.core.User;
import com.hirelight.api.Job;
import com.hirelight.db.JobDao;
import io.dropwizard.auth.Auth;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/jobs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class JobResource {

    private final JobDao jobDao;

    public JobResource(JobDao jobDao) {
        this.jobDao = jobDao;
    }

    // PUBLIC — anyone can browse jobs with backend filtering
    @GET
    public Response getPublicJobs(
            @QueryParam("category") String category,
            @QueryParam("search") String search,
            @QueryParam("minLPA") Double minLPA,
            @QueryParam("location") String location,
            @QueryParam("jobType") String jobType) {
        
        List<Job> allJobs = jobDao.getAllJobs();
        java.util.stream.Stream<Job> stream = allJobs.stream();

        // 1. Category Filter
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            String catNorm = category.toLowerCase().replaceAll("[^a-z0-9]+", " ").trim();
            stream = stream.filter(j -> {
                if ("remote".equals(catNorm)) {
                    if (j.getLocation() != null && j.getLocation().toLowerCase().contains("remote")) return true;
                }
                if ("it".equals(catNorm)) {
                    if (j.getCategory() != null && (j.getCategory().toLowerCase().contains("tech") || j.getCategory().toLowerCase().contains("software") || j.getCategory().toLowerCase().contains("it"))) return true;
                }
                if (j.getCategory() == null) return false;
                String jCat = j.getCategory().toLowerCase().replaceAll("[^a-z0-9]+", " ").trim();
                return jCat.contains(catNorm) || jCat.equals(catNorm) || catNorm.contains(jCat);
            });
        }

        // 2. Search Keyword Filter (with basic fuzzy match for typos)
        if (search != null && !search.trim().isEmpty()) {
            String s = search.toLowerCase().trim();
            int allowedErrors = s.length() > 5 ? 2 : (s.length() > 3 ? 1 : 0);
            stream = stream.filter(j -> 
                fuzzyMatch(j.getTitle(), s, allowedErrors) ||
                fuzzyMatch(j.getCompany(), s, allowedErrors) ||
                fuzzyMatch(j.getLocation(), s, allowedErrors)
            );
        }

        // 3. Location Filter (Handles multiple comma-separated locations and spelling mistakes)
        if (location != null && !location.trim().isEmpty()) {
            String[] locTokens = location.toLowerCase().split(",");
            stream = stream.filter(j -> {
                if (j.getLocation() == null) return false;
                String jobLoc = j.getLocation().toLowerCase();
                for (String token : locTokens) {
                    String t = token.trim();
                    if (t.isEmpty()) continue;
                    int allowedErrors = t.length() > 5 ? 2 : (t.length() > 3 ? 1 : 0);
                    if (fuzzyMatch(jobLoc, t, allowedErrors)) return true;
                }
                return false;
            });
        }

        // 4. Job Type Filter (e.g. Full-time, Contract)
        if (jobType != null && !jobType.trim().isEmpty()) {
            String type = jobType.toLowerCase();
            stream = stream.filter(j -> j.getType() != null && j.getType().toLowerCase().contains(type));
        }

        // 5. Backend Salary Filter removed — we now let the frontend handle "locking" jobs visually
        // instead of completely removing them from the response, especially since many real companies 
        // don't disclose salaries immediately.

        return Response.ok(stream.collect(java.util.stream.Collectors.toList())).build();
    }

    // RECRUITER — get only the jobs they posted
    @GET
    @Path("/mine")
    @RolesAllowed("RECRUITER")
    public Response getMyPostedJobs(@Auth User user) {
        return Response.ok(jobDao.getJobsByRecruiter(user.getId())).build();
    }

    // RECRUITER — platform-wide stats
    @GET
    @Path("/stats")
    @RolesAllowed("RECRUITER")
    public Response getStats(@Auth User user) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", jobDao.countJobs());
        stats.put("totalCandidates", jobDao.countCandidates());
        stats.put("totalExperiences", jobDao.countExperiences());
        stats.put("myJobsCount", jobDao.getJobsByRecruiter(user.getId()).size());
        
        List<Map<String, Object>> categoryStats = new java.util.ArrayList<>();
        jobDao.jobsByCategory().forEach((k, v) -> {
            categoryStats.add(Map.of("category", k, "cnt", v));
        });
        stats.put("jobsByCategory", categoryStats);
        
        return Response.ok(stats).build();
    }

    // RECRUITER — post a new job to DB
    @POST
    @Path("/post")
    @RolesAllowed("RECRUITER")
    public Response postJob(@Auth User user, Job job) {
        if (job.getTitle() == null || job.getCompany() == null) {
            return Response.status(400).entity(Map.of("error", "Title and company are required.")).build();
        }
        int newId = jobDao.insertJob(
            job.getTitle(), job.getCompany(),
            nvl(job.getLocation(), "Remote"),
            nvl(job.getApplyLink(), "#"),
            nvl(job.getCategory(), "tech"),
            nvl(job.getDescription(), ""),
            nvl(job.getSalary(), "Not disclosed"),
            nvl(job.getType(), "full-time"),
            user.getId()
        );
        return Response.status(201).entity(Map.of("id", newId, "message", "Job posted successfully!")).build();
    }

    // RECRUITER — update existing job
    @PUT
    @Path("/{id}")
    @RolesAllowed("RECRUITER")
    public Response updateJob(@Auth User user, @PathParam("id") int id, Job job) {
        int updated = jobDao.updateJob(
            id, job.getTitle(), job.getCompany(),
            nvl(job.getLocation(), "Remote"),
            nvl(job.getApplyLink(), "#"),
            nvl(job.getCategory(), "tech"),
            nvl(job.getDescription(), ""),
            nvl(job.getSalary(), "Not disclosed"),
            user.getId()
        );
        if (updated == 0) return Response.status(404).entity(Map.of("error", "Job not found or not yours.")).build();
        return Response.ok(Map.of("message", "Job updated.")).build();
    }

    // RECRUITER — delete a job
    @DELETE
    @Path("/{id}")
    @RolesAllowed("RECRUITER")
    public Response deleteJob(@Auth User user, @PathParam("id") int id) {
        int deleted = jobDao.deleteJob(id, user.getId());
        if (deleted == 0) return Response.status(404).entity(Map.of("error", "Job not found or not yours.")).build();
        return Response.ok(Map.of("message", "Job deleted.")).build();
    }

    private String nvl(String val, String fallback) {
        return val != null ? val : fallback;
    }

    private boolean fuzzyMatch(String text, String pattern, int maxDistance) {
        if (text == null || pattern == null) return false;
        String lowerText = text.toLowerCase();
        if (lowerText.contains(pattern)) return true;
        
        String[] words = lowerText.split("[^a-zA-Z0-9]+");
        for (String word : words) {
            if (Math.abs(word.length() - pattern.length()) <= maxDistance) {
                if (calculateDistance(word, pattern) <= maxDistance) return true;
            }
        }
        return false;
    }

    private int calculateDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) {
            int lastValue = i;
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        int newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length()] = lastValue;
        }
        return costs[s2.length()];
    }
}


