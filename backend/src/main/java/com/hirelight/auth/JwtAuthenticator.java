package com.hirelight.auth;

import com.hirelight.core.User;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.jsonwebtoken.Claims;
import java.util.Optional;

public class JwtAuthenticator implements Authenticator<String, User> {

    @Override
    public Optional<User> authenticate(String token) throws AuthenticationException {
        try {
            Claims claims = JwtUtil.validateToken(token);
            String name = claims.get("name", String.class);
            String role = claims.get("role", String.class);
            int userId = Integer.parseInt(claims.getSubject());
            return Optional.of(new User(userId, name, role));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
