package com.hirelight.resources;

import com.hirelight.core.User;
import com.hirelight.db.JobDao;
import com.hirelight.sync.JobSyncService;
import io.dropwizard.auth.Auth;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

/**
 * Admin-only endpoint: POST /jobs/sync
 * Triggers a one-time or periodic fetch of real jobs from
 * Greenhouse and Lever public APIs (no API key required).
 */
@Path("/jobs/sync")
@Produces(MediaType.APPLICATION_JSON)
public class JobSyncResource {

    private final JobSyncService syncService;

    public JobSyncResource(JobDao jobDao) {
        this.syncService = new JobSyncService(jobDao);
    }

    @POST
    @RolesAllowed("RECRUITER")
    public Response triggerSync(@Auth User user) {
        try {
            JobSyncService.SyncResult result = syncService.syncAll();
            return Response.ok(Map.of(
                "status",   "success",
                "inserted", result.inserted,
                "skipped",  result.skipped,
                "errors",   result.errors,
                "message",  result.inserted + " new jobs added from Greenhouse & Lever APIs."
            )).build();
        } catch (Exception e) {
            return Response.serverError().entity(Map.of(
                "status",  "error",
                "message", e.getMessage()
            )).build();
        }
    }
}
