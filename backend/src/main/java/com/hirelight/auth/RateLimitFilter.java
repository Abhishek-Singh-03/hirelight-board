package com.hirelight.auth;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.LinkedList;

@Provider
@RateLimited
public class RateLimitFilter implements ContainerRequestFilter {

    @Context
    private ResourceInfo resourceInfo;

    @Context
    private HttpServletRequest request;

    // Map of IP Address -> List of timestamps
    private final ConcurrentHashMap<String, LinkedList<Long>> requestCounts = new ConcurrentHashMap<>();

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        RateLimited rateLimited = resourceInfo.getResourceMethod().getAnnotation(RateLimited.class);
        if (rateLimited == null) {
            rateLimited = resourceInfo.getResourceClass().getAnnotation(RateLimited.class);
        }
        if (rateLimited == null) {
            return;
        }

        int limit = rateLimited.requests();
        long windowMillis = rateLimited.windowSeconds() * 1000L;

        String ip = getClientIp();
        long now = System.currentTimeMillis();

        requestCounts.compute(ip, (key, timestamps) -> {
            if (timestamps == null) {
                timestamps = new LinkedList<>();
            }
            
            // Remove old timestamps outside the window
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMillis) {
                timestamps.pollFirst();
            }

            // Check limit
            if (timestamps.size() >= limit) {
                // Rate limit exceeded
                requestContext.abortWith(Response.status(429)
                        .entity("{\"error\": \"Rate limit exceeded. Please try again later.\"}")
                        .type("application/json")
                        .build());
            } else {
                timestamps.addLast(now);
            }
            return timestamps;
        });
    }

    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
