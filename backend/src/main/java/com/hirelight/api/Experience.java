package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Experience {
    private String id;
    private String jobTitle;
    private String company;
    private String author; // mapped from JOIN — "Anonymous" if author_id is NULL
    private String text;   // maps from 'content' in DB
    private String date;   // maps from 'created_at' in DB
    private int upvotes;
    private String type;
    private String shareCode; // 6-character shortcode for sharing
    private boolean anonymous; // client sets this; if true, we store NULL author_id

    public Experience() {}

    @JsonProperty public String getId()        { return id; }
    @JsonProperty public String getJobTitle()  { return jobTitle; }
    @JsonProperty public String getCompany()   { return company; }
    @JsonProperty public String getAuthor()    { return author; }
    @JsonProperty public String getText()      { return text; }
    @JsonProperty public String getDate()      { return date; }
    @JsonProperty public int    getUpvotes()   { return upvotes; }
    @JsonProperty public String getType()      { return type; }
    @JsonProperty public String getShareCode() { return shareCode; }
    @JsonProperty public boolean isAnonymous() { return anonymous; }

    public void setId(String id)             { this.id = id; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public void setCompany(String company)   { this.company = company; }
    public void setAuthor(String author)     { this.author = author; }
    public void setText(String text)         { this.text = text; }
    public void setDate(String date)         { this.date = date; }
    public void setUpvotes(int upvotes)      { this.upvotes = upvotes; }
    public void setType(String type)         { this.type = type; }
    public void setShareCode(String shareCode) { this.shareCode = shareCode; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
}
