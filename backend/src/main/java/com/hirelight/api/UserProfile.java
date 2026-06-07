package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserProfile {
    private String id;
    private String name;
    private String role;
    private String bio;
    private String skills;
    private String email;
    private String passwordHash;

    public UserProfile() {}

    @JsonProperty public String getId() { return id; }
    @JsonProperty public String getName() { return name; }
    @JsonProperty public String getRole() { return role; }
    @JsonProperty public String getBio() { return bio; }
    @JsonProperty public String getSkills() { return skills; }
    @JsonProperty public String getEmail() { return email; }

    // Never serialize password to JSON
    @JsonIgnore public String getPasswordHash() { return passwordHash; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setRole(String role) { this.role = role; }
    public void setBio(String bio) { this.bio = bio; }
    public void setSkills(String skills) { this.skills = skills; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}

