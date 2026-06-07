package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Salary {
    private int id;
    private String company;
    private String role;
    private int yoe;
    private int baseSalary;
    private int bonus;
    private int stock;
    private String date;

    public Salary() {}

    @JsonProperty public int getId() { return id; }
    @JsonProperty public String getCompany() { return company; }
    @JsonProperty public String getRole() { return role; }
    @JsonProperty public int getYoe() { return yoe; }
    @JsonProperty public int getBaseSalary() { return baseSalary; }
    @JsonProperty public int getBonus() { return bonus; }
    @JsonProperty public int getStock() { return stock; }
    @JsonProperty public String getDate() { return date; }

    public void setId(int id) { this.id = id; }
    public void setCompany(String company) { this.company = company; }
    public void setRole(String role) { this.role = role; }
    public void setYoe(int yoe) { this.yoe = yoe; }
    public void setBaseSalary(int baseSalary) { this.baseSalary = baseSalary; }
    public void setBonus(int bonus) { this.bonus = bonus; }
    public void setStock(int stock) { this.stock = stock; }
    public void setDate(String date) { this.date = date; }
}
