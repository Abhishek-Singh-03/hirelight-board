package com.hirelight.db;

import com.hirelight.api.BlogPost;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;
import java.util.Optional;

@RegisterBeanMapper(BlogPost.class)
public interface BlogDao {

    String COLS = "id, slug, title, excerpt, content, cover_image as coverImage, tags, " +
                  "author_name as authorName, (published = 1) as published, " +
                  "DATE_FORMAT(created_at, '%d %b %Y') as createdAt, " +
                  "DATE_FORMAT(updated_at, '%d %b %Y') as updatedAt ";

    // Public: only published posts, no content (for listing)
    @SqlQuery("SELECT id, slug, title, excerpt, cover_image as coverImage, tags, " +
              "author_name as authorName, (published = 1) as published, " +
              "DATE_FORMAT(created_at, '%d %b %Y') as createdAt, " +
              "DATE_FORMAT(updated_at, '%d %b %Y') as updatedAt " +
              "FROM blog_posts WHERE published = 1 ORDER BY created_at DESC")
    List<BlogPost> getPublishedPosts();

    // Public: single post by slug (full content)
    @SqlQuery("SELECT " + COLS + "FROM blog_posts WHERE slug = :slug AND published = 1 LIMIT 1")
    Optional<BlogPost> getPublishedPostBySlug(@Bind("slug") String slug);

    // Admin: all posts (including drafts)
    @SqlQuery("SELECT " + COLS + "FROM blog_posts ORDER BY created_at DESC")
    List<BlogPost> getAllPosts();

    // Admin: create post
    @SqlUpdate("INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, tags, author_name, published) " +
               "VALUES (:slug, :title, :excerpt, :content, :coverImage, :tags, :authorName, :published)")
    @GetGeneratedKeys
    int insertPost(@Bind("slug") String slug,
                   @Bind("title") String title,
                   @Bind("excerpt") String excerpt,
                   @Bind("content") String content,
                   @Bind("coverImage") String coverImage,
                   @Bind("tags") String tags,
                   @Bind("authorName") String authorName,
                   @Bind("published") boolean published);

    // Admin: update post
    @SqlUpdate("UPDATE blog_posts SET slug=:slug, title=:title, excerpt=:excerpt, content=:content, " +
               "cover_image=:coverImage, tags=:tags, author_name=:authorName, published=:published " +
               "WHERE id=:id")
    int updatePost(@Bind("id") int id,
                   @Bind("slug") String slug,
                   @Bind("title") String title,
                   @Bind("excerpt") String excerpt,
                   @Bind("content") String content,
                   @Bind("coverImage") String coverImage,
                   @Bind("tags") String tags,
                   @Bind("authorName") String authorName,
                   @Bind("published") boolean published);

    // Admin: delete post
    @SqlUpdate("DELETE FROM blog_posts WHERE id = :id")
    int deletePost(@Bind("id") int id);
}
