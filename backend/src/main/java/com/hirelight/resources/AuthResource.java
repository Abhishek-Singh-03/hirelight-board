package com.hirelight.resources;

import com.hirelight.api.AuthRequest;
import com.hirelight.api.AuthResponse;
import com.hirelight.api.UserProfile;
import com.hirelight.auth.JwtUtil;
import com.hirelight.db.EmailVerificationDao;
import com.hirelight.db.UserDao;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mindrot.jbcrypt.BCrypt;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    private final UserDao userDao;
    private final EmailVerificationDao verifyDao;

    // Frontend base URL — falls back to production domain if no env var is set
    private static final String FRONTEND_BASE_URL = System.getenv("FRONTEND_URL") != null 
        ? System.getenv("FRONTEND_URL") 
        : "https://gojobwise.com";

    public AuthResource(UserDao userDao, EmailVerificationDao verifyDao) {
        this.userDao = userDao;
        this.verifyDao = verifyDao;
    }

    // REGISTER endpoint
    @POST
    @Path("/register")
    public Response register(AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null || req.getName() == null) {
            return Response.status(400).entity(Map.of("error", "Name, email, and password are required.")).build();
        }

        // Check if email already exists
        Optional<UserProfile> existing = userDao.findByEmail(req.getEmail());
        if (existing.isPresent()) {
            return Response.status(409).entity(Map.of("error", "An account with this email already exists.")).build();
        }

        // Hash password and save — new users are NOT verified by default
        String hashedPassword = BCrypt.hashpw(req.getPassword(), BCrypt.gensalt());
        String role = (req.getRole() != null && req.getRole().equals("RECRUITER")) ? "RECRUITER" : "CANDIDATE";
        int newUserId = userDao.insertUser(req.getName(), req.getEmail(), hashedPassword, role, false);

        // Generate verification token
        String verifyToken = UUID.randomUUID().toString().replace("-", "");
        verifyDao.saveVerificationToken(newUserId, verifyToken);

        String verifyLink = FRONTEND_BASE_URL + "/auth/verify-email?token=" + verifyToken;
        System.out.println("[HireLight] Email verification link for " + req.getEmail() + ": " + verifyLink);

        // Return 201 with the verify link (shown on frontend — no email needed)
        return Response.status(201).entity(Map.of(
            "message", "Account created! Please verify your email to continue.",
            "verifyLink", verifyLink,
            "email", req.getEmail(),
            "requiresVerification", true
        )).build();
    }

    // LOGIN endpoint
    @POST
    @Path("/login")
    public Response login(AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return Response.status(400).entity(Map.of("error", "Email and password are required.")).build();
        }

        Optional<UserProfile> userOpt = userDao.findByEmail(req.getEmail());
        if (!userOpt.isPresent()) {
            return Response.status(401).entity(Map.of("error", "Invalid email or password.")).build();
        }

        UserProfile user = userOpt.get();
        boolean passwordMatches = BCrypt.checkpw(req.getPassword(), user.getPasswordHash());
        if (!passwordMatches) {
            return Response.status(401).entity(Map.of("error", "Invalid email or password.")).build();
        }

        int userId = Integer.parseInt(user.getId());

        // Check email verification
        boolean verified = userDao.isEmailVerified(userId);
        if (!verified) {
            return Response.status(403).entity(Map.of(
                "error", "Please verify your email before logging in.",
                "unverified", true,
                "email", req.getEmail()
            )).build();
        }

        String token = JwtUtil.generateToken(userId, user.getName(), user.getRole());
        return Response.ok(new AuthResponse(token, user.getRole(), user.getName(), userId)).build();
    }
}
