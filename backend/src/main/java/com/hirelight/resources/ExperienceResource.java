package com.hirelight.resources;

import com.hirelight.api.Experience;
import com.hirelight.core.User;
import com.hirelight.db.ExperienceDao;
import io.dropwizard.auth.Auth;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Set;

@Path("/community")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExperienceResource {

    private final ExperienceDao experienceDao;

    // ── Content Moderation ────────────────────────────────────────────────────
    private static final int MIN_LENGTH = 50;
    private static final int MAX_LENGTH = 5000;

    // Basic blocklist — expand as needed
    private static final Set<String> BLOCKED_WORDS = Set.of(
        "fuck", "shit", "bitch", "asshole", "bastard", "porn",
        "spam", "buy now", "click here", "whatsapp me",
        "earn money", "free money", "work from home opportunity"
    );

    public ExperienceResource(ExperienceDao experienceDao) {
        this.experienceDao = experienceDao;
    }

    @GET
    public Response getExperiences() {
        return Response.ok(experienceDao.getAllExperiences()).build();
    }

    @POST
    public Response createExperience(@Auth User user, Experience exp) {
        // ── Validate required fields ──────────────────────────────────────────
        if (exp.getJobTitle() == null || exp.getJobTitle().trim().isEmpty())
            return Response.status(400).entity("{\"error\":\"Job title is required.\"}").build();
        if (exp.getCompany() == null || exp.getCompany().trim().isEmpty())
            return Response.status(400).entity("{\"error\":\"Company name is required.\"}").build();
        if (exp.getText() == null || exp.getText().trim().isEmpty())
            return Response.status(400).entity("{\"error\":\"Experience text is required.\"}").build();

        String text = exp.getText().trim();

        // ── Length check ──────────────────────────────────────────────────────
        if (text.length() < MIN_LENGTH)
            return Response.status(400)
                .entity("{\"error\":\"Please write at least 50 characters. Share more detail!\"}").build();
        if (text.length() > MAX_LENGTH)
            return Response.status(400)
                .entity("{\"error\":\"Post is too long. Keep it under 5000 characters.\"}").build();

        // ── Profanity / spam check ────────────────────────────────────────────
        String lowerText = text.toLowerCase();
        for (String blocked : BLOCKED_WORDS) {
            if (lowerText.contains(blocked)) {
                return Response.status(400)
                    .entity("{\"error\":\"Your post contains inappropriate content. Please keep the community professional.\"}").build();
            }
        }

        // ── Field length caps ─────────────────────────────────────────────────
        if (exp.getJobTitle().length() > 100)
            return Response.status(400).entity("{\"error\":\"Job title is too long.\"}").build();
        if (exp.getCompany().length() > 100)
            return Response.status(400).entity("{\"error\":\"Company name is too long.\"}").build();

        // ── Determine author: null if anonymous so the DB shows "Anonymous" ──────
        Integer authorId = exp.isAnonymous() ? null : user.getId();

        experienceDao.insertExperience(
            exp.getJobTitle().trim(),
            exp.getCompany().trim(),
            text,
            exp.getType(),
            authorId
        );
        return Response.status(201).entity("{\"message\":\"Experience posted successfully!\"}").build();
    }

    @POST
    @Path("/{id}/upvote")
    public Response upvote(@PathParam("id") int id) {
        experienceDao.upvoteExperience(id);
        return Response.ok().build();
    }
}
