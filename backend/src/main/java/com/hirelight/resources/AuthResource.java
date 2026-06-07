package com.hirelight.resources;

import com.hirelight.api.AuthRequest;
import com.hirelight.api.AuthResponse;
import com.hirelight.api.UserProfile;
import com.hirelight.auth.JwtUtil;
import com.hirelight.db.UserDao;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mindrot.jbcrypt.BCrypt;
import java.util.Map;
import java.util.Optional;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    private final UserDao userDao;

    public AuthResource(UserDao userDao) {
        this.userDao = userDao;
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

        // Hash password and save
        String hashedPassword = BCrypt.hashpw(req.getPassword(), BCrypt.gensalt());
        String role = (req.getRole() != null && req.getRole().equals("RECRUITER")) ? "RECRUITER" : "CANDIDATE";
        int newUserId = userDao.insertUser(req.getName(), req.getEmail(), hashedPassword, role);

        // Generate JWT
        String token = JwtUtil.generateToken(newUserId, req.getName(), role);
        return Response.status(201).entity(new AuthResponse(token, role, req.getName(), newUserId)).build();
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
        String token = JwtUtil.generateToken(userId, user.getName(), user.getRole());
        return Response.ok(new AuthResponse(token, user.getRole(), user.getName(), userId)).build();
    }
}
