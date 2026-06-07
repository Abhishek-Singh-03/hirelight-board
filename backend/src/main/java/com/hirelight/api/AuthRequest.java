package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "CANDIDATE" or "RECRUITER"

    public AuthRequest() {}

    @JsonProperty public String getName() { return name; }
    @JsonProperty public String getEmail() { return email; }
    @JsonProperty public String getPassword() { return password; }
    @JsonProperty public String getRole() { return role; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
}
