package com.hirelight.auth;

import com.hirelight.core.User;
import io.dropwizard.auth.Authorizer;
import jakarta.ws.rs.container.ContainerRequestContext;
import org.checkerframework.checker.nullness.qual.Nullable;

public class HireLightAuthorizer implements Authorizer<User> {
    @Override
    public boolean authorize(User user, String role, @Nullable ContainerRequestContext requestContext) {
        return user.getRole() != null && user.getRole().equalsIgnoreCase(role);
    }
}
