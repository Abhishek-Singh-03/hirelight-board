package com.hirelight.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BlogPost {
    private int id;
    private String slug;
    private String title;
    private String excerpt;
    private String content;
    private String coverImage;
    private String tags;
    private String authorName;
    private boolean published;
    private String createdAt;
    private String updatedAt;

    public BlogPost() {}

    @JsonProperty public int getId() { return id; }
    @JsonProperty public void setId(int id) { this.id = id; }

    @JsonProperty public String getSlug() { return slug; }
    @JsonProperty public void setSlug(String slug) { this.slug = slug; }

    @JsonProperty public String getTitle() { return title; }
    @JsonProperty public void setTitle(String title) { this.title = title; }

    @JsonProperty public String getExcerpt() { return excerpt; }
    @JsonProperty public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    @JsonProperty public String getContent() { return content; }
    @JsonProperty public void setContent(String content) { this.content = content; }

    @JsonProperty public String getCoverImage() { return coverImage; }
    @JsonProperty public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    @JsonProperty public String getTags() { return tags; }
    @JsonProperty public void setTags(String tags) { this.tags = tags; }

    @JsonProperty public String getAuthorName() { return authorName; }
    @JsonProperty public void setAuthorName(String authorName) { this.authorName = authorName; }

    @JsonProperty public boolean isPublished() { return published; }
    @JsonProperty public void setPublished(boolean published) { this.published = published; }

    @JsonProperty public String getCreatedAt() { return createdAt; }
    @JsonProperty public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    @JsonProperty public String getUpdatedAt() { return updatedAt; }
    @JsonProperty public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
