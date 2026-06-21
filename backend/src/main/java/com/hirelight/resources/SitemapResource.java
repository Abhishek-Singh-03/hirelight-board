package com.hirelight.resources;

import com.hirelight.api.Job;
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
    private static final String DOMAIN = "https://gojobwise.com";

    public SitemapResource(JobDao jobDao) {
        this.jobDao = jobDao;
    }

    @GET
    public String getSitemap() {
        List<Job> jobs = jobDao.getAllJobs();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Add the homepage
        xml.append("  <url>\n");
        xml.append("    <loc>").append(DOMAIN).append("/</loc>\n");
        xml.append("    <changefreq>daily</changefreq>\n");
        xml.append("    <priority>1.0</priority>\n");
        xml.append("  </url>\n");

        // Add the jobs
        for (Job job : jobs) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(DOMAIN).append("/jobs/").append(job.getId()).append("</loc>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }
}
