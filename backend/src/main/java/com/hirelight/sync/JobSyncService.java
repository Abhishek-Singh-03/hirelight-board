package com.hirelight.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirelight.db.JobDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Fetches real, active job listings (last 15 days) from official Greenhouse
 * and Lever public APIs. No API key required — these are public job feeds
 * that companies intentionally expose for partner syndication.
 */
public class JobSyncService {

    private static final Logger LOG = LoggerFactory.getLogger(JobSyncService.class);
    // Jobs posted within this many days are considered active
    private static final int DAYS_BACK = 90;
    private static final int SYSTEM_RECRUITER_ID = 1; // Your admin account ID

    private final JobDao jobDao;
    private final HttpClient http;
    private final ObjectMapper mapper;

    // ── Greenhouse companies — VERIFIED working slugs ────────────────────────
    private static final String[][] GREENHOUSE_COMPANIES = {
        {"Groww",           "groww"},
        {"Postman",         "postman"},
        {"GitLab",          "gitlab"},
        {"Stripe",          "stripe"},
        {"Coinbase",        "coinbase"},
        {"Figma",           "figma"},
        {"Vercel",          "vercel"},
        {"HashiCorp",       "hashicorp"},
        {"Docker",          "docker"},
        {"Databricks",      "databricks"},
        {"dbt Labs",        "dbtlabs"},
        {"Canva",           "canva"},
    };

    // ── Lever companies — VERIFIED working slugs ─────────────────────────────
    private static final String[][] LEVER_COMPANIES = {
        {"Freshworks",      "freshworks"},
        {"Chargebee",       "chargebee-inc"},
        {"Razorpay",        "razorpay-1"},
        {"Browserstack",    "browserstack-1"},
        {"Setu",            "setu-api"},
        {"Exotel",          "exotel-1"},
    };

    public JobSyncService(JobDao jobDao) {
        this.jobDao = jobDao;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper();
    }

    /**
     * Main entry point. Fetches from all sources and returns total inserted count.
     */
    public SyncResult syncAll() {
        int inserted = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        LOG.info("=== HireLight Job Sync Started ===");

        for (String[] company : GREENHOUSE_COMPANIES) {
            try {
                SyncResult r = syncGreenhouse(company[0], company[1]);
                inserted += r.inserted;
                skipped  += r.skipped;
                LOG.info("[Greenhouse] {} → {} inserted, {} skipped", company[0], r.inserted, r.skipped);
            } catch (Exception e) {
                String msg = "Greenhouse/" + company[0] + ": " + e.getMessage();
                errors.add(msg);
                LOG.warn("[Greenhouse] {} failed: {}", company[0], e.getMessage());
            }
        }

        for (String[] company : LEVER_COMPANIES) {
            try {
                SyncResult r = syncLever(company[0], company[1]);
                inserted += r.inserted;
                skipped  += r.skipped;
                LOG.info("[Lever] {} → {} inserted, {} skipped", company[0], r.inserted, r.skipped);
            } catch (Exception e) {
                String msg = "Lever/" + company[0] + ": " + e.getMessage();
                errors.add(msg);
                LOG.warn("[Lever] {} failed: {}", company[0], e.getMessage());
            }
        }

        LOG.info("=== Sync Complete: {} inserted, {} skipped, {} errors ===", inserted, skipped, errors.size());
        return new SyncResult(inserted, skipped, errors);
    }

    // ── Greenhouse ─────────────────────────────────────────────────────────────
    private SyncResult syncGreenhouse(String companyName, String boardToken) throws Exception {
        String url = "https://boards-api.greenhouse.io/v1/boards/" + boardToken + "/jobs?content=true";
        String json = get(url);
        JsonNode root = mapper.readTree(json);
        JsonNode jobsArr = root.path("jobs");

        int inserted = 0, skipped = 0;
        Instant cutoff = Instant.now().minus(DAYS_BACK, ChronoUnit.DAYS);

        for (JsonNode j : jobsArr) {
            try {
                // Date check
                String updatedAt = j.path("updated_at").asText("");
                if (!updatedAt.isEmpty()) {
                    Instant jobDate = Instant.parse(updatedAt);
                    if (jobDate.isBefore(cutoff)) { skipped++; continue; }
                }

                String title    = j.path("title").asText("Unknown Role");
                String location = extractGreenhouseLocation(j);
                String applyLink = j.path("absolute_url").asText("");
                String description = extractGreenhouseDescription(j);
                String category = guessCategory(title, description);
                String postedOn = formatDate(updatedAt);

                if (applyLink.isEmpty()) { skipped++; continue; }

                int result = jobDao.insertJobIfNotExists(
                    title, companyName, location, applyLink,
                    category, description, null, "Full-time",
                    SYSTEM_RECRUITER_ID, postedOn
                );
                if (result > 0) inserted++; else skipped++;

            } catch (Exception e) {
                skipped++;
                LOG.debug("Skipping Greenhouse job entry: {}", e.getMessage());
            }
        }
        return new SyncResult(inserted, skipped, List.of());
    }

    // ── Lever ──────────────────────────────────────────────────────────────────
    private SyncResult syncLever(String companyName, String companySlug) throws Exception {
        String url = "https://api.lever.co/v0/postings/" + companySlug + "?mode=json";
        String json = get(url);
        JsonNode jobsArr = mapper.readTree(json);

        int inserted = 0, skipped = 0;
        Instant cutoff = Instant.now().minus(DAYS_BACK, ChronoUnit.DAYS);

        for (JsonNode j : jobsArr) {
            try {
                // Date check (Lever uses epoch millis)
                long createdAtMs = j.path("createdAt").asLong(0);
                if (createdAtMs > 0) {
                    Instant jobDate = Instant.ofEpochMilli(createdAtMs);
                    if (jobDate.isBefore(cutoff)) { skipped++; continue; }
                }

                String title    = j.path("text").asText("Unknown Role");
                String location = j.path("categories").path("location").asText("India");
                String applyLink = j.path("hostedUrl").asText("");
                String description = extractLeverDescription(j);
                String category = guessCategory(title, description);
                String postedOn = createdAtMs > 0
                        ? LocalDateTime.ofInstant(Instant.ofEpochMilli(createdAtMs), ZoneId.of("Asia/Kolkata"))
                                   .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                        : LocalDateTime.now(ZoneId.of("Asia/Kolkata")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

                if (applyLink.isEmpty()) { skipped++; continue; }

                int result = jobDao.insertJobIfNotExists(
                    title, companyName, location, applyLink,
                    category, description, null, "Full-time",
                    SYSTEM_RECRUITER_ID, postedOn
                );
                if (result > 0) inserted++; else skipped++;

            } catch (Exception e) {
                skipped++;
                LOG.debug("Skipping Lever job entry: {}", e.getMessage());
            }
        }
        return new SyncResult(inserted, skipped, List.of());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String get(String url) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .header("User-Agent", "HireLight/1.0 JobSyncBot")
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new RuntimeException("HTTP " + resp.statusCode() + " for " + url);
        }
        return resp.body();
    }

    private String extractGreenhouseLocation(JsonNode j) {
        JsonNode loc = j.path("location");
        if (!loc.isMissingNode()) return loc.path("name").asText("India");
        return "India";
    }

    private String extractGreenhouseDescription(JsonNode j) {
        String raw = j.path("content").asText("");
        // Strip HTML tags for a clean plain-text description
        return raw.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }

    private String extractLeverDescription(JsonNode j) {
        StringBuilder sb = new StringBuilder();
        JsonNode lists = j.path("lists");
        if (!lists.isMissingNode()) {
            for (JsonNode list : lists) {
                String text = list.path("content").asText("").replaceAll("<[^>]*>", " ");
                sb.append(text).append(" ");
            }
        }
        String desc = j.path("descriptionPlain").asText("");
        if (!desc.isEmpty()) return desc.trim();
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    /**
     * Smart category guesser based on job title and description keywords.
     * Uses word boundaries to avoid false matches (e.g. "internal" → "internship").
     */
    private String guessCategory(String title, String desc) {
        // Only use the title for category guessing — descriptions are too noisy
        String t = title.toLowerCase();
        String combined = t + " " + desc.toLowerCase().substring(0, Math.min(desc.length(), 200));

        // Use word boundary regex to avoid false positives like "internal" → "internship"
        if (java.util.regex.Pattern.compile("\\bintern\\b|\\binternship\\b").matcher(t).find()) return "internship";
        if (java.util.regex.Pattern.compile("\\bremote\\b").matcher(t).find())                  return "remote";
        if (java.util.regex.Pattern.compile("\\bfinance\\b|\\baccounting\\b|\\bbanking\\b").matcher(t).find()) return "finance";
        if (java.util.regex.Pattern.compile("\\bdesign\\b|\\bui\\b|\\bux\\b|\\bdesigner\\b").matcher(t).find()) return "design";
        if (java.util.regex.Pattern.compile("\\bfresher\\b|\\bgraduate\\b|\\bentry.level\\b").matcher(t).find()) return "fresher";
        // Default for tech companies
        return "tech";
    }

    private String formatDate(String iso) {
        try {
            Instant instant = Instant.parse(iso);
            return LocalDateTime.ofInstant(instant, ZoneId.of("Asia/Kolkata"))
                            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        } catch (Exception e) {
            return LocalDateTime.now(ZoneId.of("Asia/Kolkata")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
    }

    // ── Result DTO ─────────────────────────────────────────────────────────────
    public static class SyncResult {
        public final int inserted;
        public final int skipped;
        public final List<String> errors;

        public SyncResult(int inserted, int skipped, List<String> errors) {
            this.inserted = inserted;
            this.skipped  = skipped;
            this.errors   = errors;
        }
    }
}
