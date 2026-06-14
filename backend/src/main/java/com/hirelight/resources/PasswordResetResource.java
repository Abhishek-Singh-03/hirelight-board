package com.hirelight.resources;

import com.hirelight.api.UserProfile;
import com.hirelight.db.EmailVerificationDao;
import com.hirelight.db.PasswordResetDao;
import com.hirelight.db.UserDao;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mindrot.jbcrypt.BCrypt;
import java.net.URI;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PasswordResetResource {

    private final UserDao userDao;
    private final PasswordResetDao resetDao;
    private final EmailVerificationDao verifyDao;

    // Frontend base URL — change this to your production domain when deployed
    private static final String FRONTEND_BASE_URL = "http://localhost:5173";

    public PasswordResetResource(UserDao userDao, PasswordResetDao resetDao, EmailVerificationDao verifyDao) {
        this.userDao = userDao;
        this.resetDao = resetDao;
        this.verifyDao = verifyDao;
    }

    // ── Forgot Password: Generate reset token ────────────────────────────────
    @POST
    @Path("/forgot-password")
    public Response forgotPassword(Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Email is required.")).build();
        }

        Optional<UserProfile> userOpt = userDao.findByEmail(email.trim().toLowerCase());
        if (!userOpt.isPresent()) {
            // Don't reveal if email exists — always return success
            return Response.ok(Map.of(
                "message", "If that email is registered, a reset link has been generated.",
                "resetLink", FRONTEND_BASE_URL + "/reset-password?token=NOT_FOUND"
            )).build();
        }

        UserProfile user = userOpt.get();
        int userId = Integer.parseInt(user.getId());

        // Delete any existing tokens for this user
        resetDao.deleteAllForUser(userId);

        // Generate secure token
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        resetDao.saveResetToken(userId, token);

        String resetLink = FRONTEND_BASE_URL + "/reset-password?token=" + token;
        System.out.println("[HireLight] Password reset link for " + email + ": " + resetLink);

        // Return the link directly (no email required — shown on frontend)
        return Response.ok(Map.of(
            "message", "Reset link generated successfully.",
            "resetLink", resetLink,
            "note", "In production, this link would be emailed. For now, use it directly."
        )).build();
    }

    // ── Reset Password: Consume token + set new password ─────────────────────
    @POST
    @Path("/reset-password")
    public Response resetPassword(Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");

        if (token == null || token.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Token is required.")).build();
        }
        if (newPassword == null || newPassword.length() < 6) {
            return Response.status(400).entity(Map.of("error", "Password must be at least 6 characters.")).build();
        }

        Optional<Integer> userIdOpt = resetDao.findUserIdByToken(token);
        if (!userIdOpt.isPresent()) {
            return Response.status(400).entity(Map.of("error", "This reset link is invalid or has expired.")).build();
        }

        int userId = userIdOpt.get();
        String hashedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        userDao.updatePassword(userId, hashedPassword);
        resetDao.markTokenUsed(token);

        return Response.ok(Map.of("message", "Password updated successfully. You can now log in.")).build();
    }

    // ── Verify Email: Consume verification token ──────────────────────────────
    @GET
    @Path("/verify-email")
    @Produces(MediaType.TEXT_HTML)
    public Response verifyEmail(@QueryParam("token") String token) {
        if (token == null || token.isBlank()) {
            return Response.status(400).entity("<h2>Invalid verification link.</h2>").build();
        }

        Optional<Integer> userIdOpt = verifyDao.findUserIdByToken(token);
        if (!userIdOpt.isPresent()) {
            return Response.temporaryRedirect(URI.create(FRONTEND_BASE_URL + "/auth?verified=expired")).build();
        }

        int userId = userIdOpt.get();
        userDao.setEmailVerified(userId);
        verifyDao.deleteToken(token);

        return Response.temporaryRedirect(URI.create(FRONTEND_BASE_URL + "/auth?verified=true")).build();
    }

    // ── Resend Verification Email ──────────────────────────────────────────────
    @POST
    @Path("/resend-verification")
    public Response resendVerification(Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Email is required.")).build();
        }

        Optional<UserProfile> userOpt = userDao.findByEmail(email.trim().toLowerCase());
        if (!userOpt.isPresent()) {
            return Response.ok(Map.of("message", "If that email is registered, a new verification link has been generated.")).build();
        }

        UserProfile user = userOpt.get();
        int userId = Integer.parseInt(user.getId());

        verifyDao.deleteAllForUser(userId);
        String token = UUID.randomUUID().toString().replace("-", "");
        verifyDao.saveVerificationToken(userId, token);

        String verifyLink = FRONTEND_BASE_URL + "/auth/verify-email?token=" + token;
        System.out.println("[HireLight] Verification link for " + email + ": " + verifyLink);

        return Response.ok(Map.of(
            "message", "Verification link regenerated.",
            "verifyLink", verifyLink
        )).build();
    }
}
