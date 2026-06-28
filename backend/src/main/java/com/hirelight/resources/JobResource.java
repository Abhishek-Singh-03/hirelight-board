package com.hirelight.resources;

import com.hirelight.core.User;
import com.hirelight.api.Job;
import com.hirelight.db.JobDao;
import com.hirelight.db.UserJobDao;
import io.jsonwebtoken.Claims;
import io.dropwizard.auth.Auth;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/jobs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class JobResource {

    private final JobDao jobDao;
    private final UserJobDao userJobDao;

    public JobResource(JobDao jobDao, UserJobDao userJobDao) {
        this.jobDao = jobDao;
        this.userJobDao = userJobDao;
    }

    // PUBLIC — anyone can browse jobs with server-side filtering + pagination
    @GET
    public Response getPublicJobs(
            @QueryParam("category") String category,
            @QueryParam("search") String search,
            @QueryParam("minLPA") Double minLPA,
            @QueryParam("location") String location,
            @QueryParam("jobType") String jobType,
            @QueryParam("skills") String skills,
            @QueryParam("page") @jakarta.ws.rs.DefaultValue("1") int page,
            @QueryParam("pageSize") @jakarta.ws.rs.DefaultValue("20") int pageSize,
            @HeaderParam("Authorization") String authHeader) {

        // Clamp page size between 1 and 100
        pageSize = Math.min(Math.max(pageSize, 1), 100);
        int offset = (Math.max(page, 1) - 1) * pageSize;

        // Normalize empty strings to null for clean SQL matching
        String cat    = nullIfEmpty(category);
        String srch   = nullIfEmpty(search);
        String loc    = nullIfEmpty(location);
        String jtype  = nullIfEmpty(jobType);

        // For AI resume matching: the frontend sends comma-separated skills.
        // We pick the first skill keyword for the SQL LIKE — this covers the dominant skill.
        // (Full multi-skill ranking would require a score column; this is fast & effective.)
        String skillParam = null;
        if (skills != null && !skills.trim().isEmpty()) {
            String[] skillArr = skills.split(",");
            // Use the longest skill token (usually the most specific)
            skillParam = java.util.Arrays.stream(skillArr)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .max(java.util.Comparator.comparingInt(String::length))
                .orElse(null);
        }

        List<Job> jobs = jobDao.getJobsPaginated(cat, srch, loc, jtype, skillParam, pageSize, offset);
        int total      = jobDao.countJobsPaginated(cat, srch, loc, jtype, skillParam);

        // Exclude already-swiped jobs for authenticated users (post-filter — small list)
        Integer userId = getUserIdFromAuth(authHeader);
        if (userId != null) {
            List<Integer> swipedIds = userJobDao.getSwipedJobIds(userId);
            if (swipedIds != null && !swipedIds.isEmpty()) {
                jobs = jobs.stream().filter(j -> {
                    try { return !swipedIds.contains(Integer.parseInt(j.getId())); }
                    catch (NumberFormatException e) { return true; }
                }).collect(java.util.stream.Collectors.toList());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("jobs", jobs);
        result.put("totalCount", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("totalPages", (int) Math.ceil((double) total / pageSize));

        return Response.ok(result).build();
    }

    private String nullIfEmpty(String s) {
        return (s == null || s.trim().isEmpty()) ? null : s.trim();
    }

    // PUBLIC — get a single job by ID (for job detail page + SEO)
    @GET
    @Path("/{id}/detail")
    public Response getJobById(@PathParam("id") int id) {
        Optional<com.hirelight.api.Job> jobOpt = jobDao.getJobById(id);
        if (!jobOpt.isPresent()) {
            return Response.status(404).entity(Map.of("error", "Job not found.")).build();
        }
        return Response.ok(jobOpt.get()).build();
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
            user.getId(),
            job.getLastDateToApply(),
            job.getExperienceRequired(),
            job.getEducationRequired(),
            job.getSkills(),
            nvl(job.getWorkMode(), "Remote")
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
            nvl(job.getType(), "full-time"),
            user.getId(),
            job.getLastDateToApply(),
            job.getExperienceRequired(),
            job.getEducationRequired(),
            job.getSkills(),
            nvl(job.getWorkMode(), "Remote")
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

    private Integer getUserIdFromAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            Claims claims = com.hirelight.auth.JwtUtil.validateToken(token);
            return Integer.parseInt(claims.getSubject());
        } catch (Exception e) {
            return null;
        }
    }

    @GET
    @Path("/tracked")
    @RolesAllowed("CANDIDATE")
    public Response getTrackedJobs(@Auth User user) {
        return Response.ok(userJobDao.getUserTrackedJobs(user.getId())).build();
    }

    @POST
    @Path("/{id}/stage")
    @RolesAllowed("CANDIDATE")
    public Response updateJobStage(
            @Auth User user,
            @PathParam("id") int jobId,
            @QueryParam("status") String status) {
        if (status == null || status.trim().isEmpty()) {
            return Response.status(400).entity(Map.of("error", "Status parameter is required.")).build();
        }
        String stage = status.toUpperCase().trim();
        if (!List.of("SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "PASSED").contains(stage)) {
            return Response.status(400).entity(Map.of("error", "Invalid status: " + status)).build();
        }
        
        userJobDao.insertOrUpdateStage(user.getId(), jobId, stage);
        return Response.ok(Map.of("message", "Job stage updated successfully to " + stage)).build();
    }

    @DELETE
    @Path("/{id}/track")
    @RolesAllowed("CANDIDATE")
    public Response deleteTrackedJob(
            @Auth User user,
            @PathParam("id") int jobId) {
        int deleted = userJobDao.deleteTrackedJob(user.getId(), jobId);
        if (deleted == 0) {
            return Response.status(404).entity(Map.of("error", "Job not found in your tracker.")).build();
        }
        return Response.ok(Map.of("message", "Job removed from tracker successfully.")).build();
    }
}


