package com.hirelight.resources;

import com.hirelight.api.BlogPost;
import com.hirelight.api.Job;
import com.hirelight.db.BlogDao;
import com.hirelight.db.JobDao;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/sitemap.xml")
@Produces(MediaType.APPLICATION_XML)
public class SitemapResource {

    private final JobDao jobDao;
    private final BlogDao blogDao;
    private static final String DOMAIN = "https://gojobwise.com";

    public SitemapResource(JobDao jobDao, BlogDao blogDao) {
        this.jobDao = jobDao;
        this.blogDao = blogDao;
    }

    @GET
    public String getSitemap() {
        List<Job> jobs = jobDao.getAllJobs();
        List<BlogPost> blogPosts = blogDao.getPublishedPosts();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Static pages
        addUrl(xml, DOMAIN + "/",          "daily",  "1.0");
        addUrl(xml, DOMAIN + "/blog",       "weekly", "0.9");
        addUrl(xml, DOMAIN + "/community",  "daily",  "0.7");
        addUrl(xml, DOMAIN + "/salaries",   "weekly", "0.7");
        addUrl(xml, DOMAIN + "/auth",       "monthly","0.4");

        // Blog posts — high priority for SEO
        for (BlogPost post : blogPosts) {
            if (post.getSlug() != null && !post.getSlug().isBlank()) {
                addUrl(xml, DOMAIN + "/blog/" + post.getSlug(), "monthly", "0.9");
            }
        }

        // Job detail pages
        for (Job job : jobs) {
            addUrl(xml, DOMAIN + "/jobs/" + job.getId(), "weekly", "0.8");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private void addUrl(StringBuilder xml, String loc, String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escapeXml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
