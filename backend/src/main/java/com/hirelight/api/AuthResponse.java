package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {
    private String token;
    private String role;
    private String name;
    private int userId;

    public AuthResponse() {}

    public AuthResponse(String token, String role, String name, int userId) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.userId = userId;
    }

    @JsonProperty public String getToken() { return token; }
    @JsonProperty public String getRole() { return role; }
    @JsonProperty public String getName() { return name; }
    @JsonProperty public int getUserId() { return userId; }
}
