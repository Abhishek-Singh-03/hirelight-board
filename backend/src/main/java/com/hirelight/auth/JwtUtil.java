package com.hirelight.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JwtUtil {

    // Secret key - in production, load this from config.yml or environment variable
    private static final String SECRET = "hirelight-super-secret-jwt-key-2026-must-be-long-enough";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    private static final long EXPIRY_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public static String generateToken(int userId, String name, String role) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("name", name)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
            .signWith(KEY)
            .compact();
    }

    public static Claims validateToken(String token) {
        return Jwts.parser()
            .verifyWith(KEY)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
