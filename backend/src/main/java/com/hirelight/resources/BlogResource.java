package com.hirelight.resources;

import com.hirelight.api.BlogPost;
import com.hirelight.auth.JwtUtil;
import com.hirelight.db.BlogDao;
import io.jsonwebtoken.Claims;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/blog")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BlogResource {

    private final BlogDao blogDao;
    private static final String ADMIN_SECRET = System.getenv().getOrDefault("ADMIN_SECRET", "gjw-admin-2025");

    public BlogResource(BlogDao blogDao) {
        this.blogDao = blogDao;
    }

    // ── PUBLIC ENDPOINTS ─────────────────────────────────────────────────────

    /** List all published posts (no full content — just meta for listing page) */
    @GET
    public Response getPublishedPosts() {
        return Response.ok(blogDao.getPublishedPosts()).build();
    }

    /** Get single published post by slug */
    @GET
    @Path("/{slug}")
    public Response getPostBySlug(@PathParam("slug") String slug) {
        Optional<BlogPost> post = blogDao.getPublishedPostBySlug(slug);
        if (post.isEmpty()) {
            return Response.status(404).entity(Map.of("error", "Post not found")).build();
        }
        return Response.ok(post.get()).build();
    }

    // ── ADMIN ENDPOINTS (protected by Authorization header with admin secret) ─

    /** List ALL posts including drafts */
    @GET
    @Path("/admin/all")
    public Response getAllPosts(@HeaderParam("Authorization") String auth) {
        if (!isAdmin(auth)) return forbidden();
        return Response.ok(blogDao.getAllPosts()).build();
    }

    /** Create a new post */
    @POST
    @Path("/admin")
    public Response createPost(@HeaderParam("Authorization") String auth, BlogPost post) {
        if (!isAdmin(auth)) return forbidden();
        if (post.getTitle() == null || post.getTitle().isBlank()) {
            return Response.status(400).entity(Map.of("error", "Title is required")).build();
        }
        String slug = post.getSlug() != null && !post.getSlug().isBlank()
            ? post.getSlug()
            : toSlug(post.getTitle());

        int id = blogDao.insertPost(
            slug,
            post.getTitle(),
            nvl(post.getExcerpt(), ""),
            nvl(post.getContent(), ""),
            nvl(post.getCoverImage(), ""),
            nvl(post.getTags(), ""),
            nvl(post.getAuthorName(), "GoJobWise Team"),
            post.isPublished()
        );
        return Response.status(201).entity(Map.of("id", id, "slug", slug, "message", "Post created!")).build();
    }

    /** Update an existing post */
    @PUT
    @Path("/admin/{id}")
    public Response updatePost(@HeaderParam("Authorization") String auth,
                               @PathParam("id") int id,
                               BlogPost post) {
        if (!isAdmin(auth)) return forbidden();
        String slug = post.getSlug() != null && !post.getSlug().isBlank()
            ? post.getSlug()
            : toSlug(post.getTitle());
        int updated = blogDao.updatePost(
            id, slug, post.getTitle(),
            nvl(post.getExcerpt(), ""),
            nvl(post.getContent(), ""),
            nvl(post.getCoverImage(), ""),
            nvl(post.getTags(), ""),
            nvl(post.getAuthorName(), "GoJobWise Team"),
            post.isPublished()
        );
        if (updated == 0) return Response.status(404).entity(Map.of("error", "Post not found")).build();
        return Response.ok(Map.of("message", "Post updated!")).build();
    }

    /** Delete a post */
    @DELETE
    @Path("/admin/{id}")
    public Response deletePost(@HeaderParam("Authorization") String auth, @PathParam("id") int id) {
        if (!isAdmin(auth)) return forbidden();
        blogDao.deletePost(id);
        return Response.ok(Map.of("message", "Post deleted")).build();
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────

    private boolean isAdmin(String auth) {
        if (auth == null) return false;
        // Accept either "Bearer <admin-secret>" or JWT of a RECRUITER
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : auth;
        if (token.equals(ADMIN_SECRET)) return true;
        try {
            Claims claims = JwtUtil.validateToken(token);
            String role = claims.get("role", String.class);
            return "RECRUITER".equals(role);
        } catch (Exception e) {
            return false;
        }
    }

    private Response forbidden() {
        return Response.status(403).entity(Map.of("error", "Admin access required")).build();
    }

    private String nvl(String v, String fallback) {
        return (v != null && !v.isBlank()) ? v : fallback;
    }

    private String toSlug(String title) {
        return title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-")
            + "-" + System.currentTimeMillis() % 10000;
    }
}
