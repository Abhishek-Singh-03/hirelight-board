package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Job {
    private String id;
    private String title;
    private String company;
    private String location;
    private String applyLink;
    private String postedOn;
    private String category;
    private String description;
    private String salary;
    private String type;

    public Job() {}

    public Job(String id, String title, String company, String location, String applyLink, String postedOn, String category, String description, String salary, String type) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.applyLink = applyLink;
        this.postedOn = postedOn;
        this.category = category;
        this.description = description;
        this.salary = salary;
        this.type = type;
    }

    @JsonProperty public String getId() { return id; }
    @JsonProperty public String getTitle() { return title; }
    @JsonProperty public String getCompany() { return company; }
    @JsonProperty public String getLocation() { return location; }
    @JsonProperty public String getApplyLink() { return applyLink; }
    @JsonProperty public String getPostedOn() { return postedOn; }
    @JsonProperty public String getCategory() { return category; }
    @JsonProperty public String getDescription() { return description; }
    @JsonProperty public String getSalary() { return salary; }
    @JsonProperty public String getType() { return type; }

    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setCompany(String company) { this.company = company; }
    public void setLocation(String location) { this.location = location; }
    public void setApplyLink(String applyLink) { this.applyLink = applyLink; }
    public void setPostedOn(String postedOn) { this.postedOn = postedOn; }
    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setSalary(String salary) { this.salary = salary; }
    public void setType(String type) { this.type = type; }
}
