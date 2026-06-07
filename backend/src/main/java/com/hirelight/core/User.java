package com.hirelight.core;

import java.security.Principal;

public class User implements Principal {
    private final int id;
    private final String name;
    private final String role;

    public User(int id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    public User(String name, String role) {
        this(0, name, role);
    }

    @Override
    public String getName() {
        return name;
    }

    public int getId() {
        return id;
    }

    public String getRole() {
        return role;
    }
}
