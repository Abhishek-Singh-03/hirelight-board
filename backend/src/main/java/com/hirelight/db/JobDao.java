package com.hirelight.db;

import com.hirelight.api.Job;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.config.KeyColumn;
import org.jdbi.v3.sqlobject.config.ValueColumn;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.List;
import java.util.Optional;

@RegisterBeanMapper(Job.class)
public interface JobDao {

    String COLS = "CAST(id AS CHAR) as id, title, company, location, apply_link as applyLink, " +
                  "DATE_FORMAT(posted_on, '%d/%m/%Y %H:%i') as postedOn, category, description, salary, type, " +
                  "last_date_to_apply as lastDateToApply, experience_required as experienceRequired, " +
                  "education_required as educationRequired, skills, work_mode as workMode ";

    @SqlQuery("SELECT " + COLS + "FROM jobs ORDER BY posted_on DESC")
    List<Job> getAllJobs();

    /**
     * Paginated + server-side filtered query.
     * skills: comma-separated skill keywords to match against title/description/category (empty = no filter).
     * excludeIds: comma-separated job IDs to exclude (already swiped by user). Pass empty string to skip.
     */
    @SqlQuery("SELECT " + COLS + "FROM jobs " +
              "WHERE (:category IS NULL OR :category = '' OR :category = 'all' OR LOWER(category) LIKE CONCAT('%', LOWER(:category), '%') OR (:category = 'remote' AND LOWER(location) LIKE '%remote%')) " +
              "AND (:search IS NULL OR :search = '' OR LOWER(title) LIKE CONCAT('%', LOWER(:search), '%') OR LOWER(company) LIKE CONCAT('%', LOWER(:search), '%') OR LOWER(location) LIKE CONCAT('%', LOWER(:search), '%')) " +
              "AND (:location IS NULL OR :location = '' OR LOWER(location) LIKE CONCAT('%', LOWER(:location), '%')) " +
              "AND (:jobType IS NULL OR :jobType = '' OR LOWER(type) LIKE CONCAT('%', LOWER(:jobType), '%')) " +
              "AND (:skills IS NULL OR :skills = '' OR LOWER(title) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(description) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(category) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(skills) LIKE CONCAT('%', LOWER(:skills), '%')) " +
              "ORDER BY posted_on DESC " +
              "LIMIT :limit OFFSET :offset")
    List<Job> getJobsPaginated(
              @Bind("category") String category,
              @Bind("search") String search,
              @Bind("location") String location,
              @Bind("jobType") String jobType,
              @Bind("skills") String skills,
              @Bind("limit") int limit,
              @Bind("offset") int offset);

    @SqlQuery("SELECT COUNT(*) FROM jobs " +
              "WHERE (:category IS NULL OR :category = '' OR :category = 'all' OR LOWER(category) LIKE CONCAT('%', LOWER(:category), '%') OR (:category = 'remote' AND LOWER(location) LIKE '%remote%')) " +
              "AND (:search IS NULL OR :search = '' OR LOWER(title) LIKE CONCAT('%', LOWER(:search), '%') OR LOWER(company) LIKE CONCAT('%', LOWER(:search), '%') OR LOWER(location) LIKE CONCAT('%', LOWER(:search), '%')) " +
              "AND (:location IS NULL OR :location = '' OR LOWER(location) LIKE CONCAT('%', LOWER(:location), '%')) " +
              "AND (:jobType IS NULL OR :jobType = '' OR LOWER(type) LIKE CONCAT('%', LOWER(:jobType), '%')) " +
              "AND (:skills IS NULL OR :skills = '' OR LOWER(title) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(description) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(category) LIKE CONCAT('%', LOWER(:skills), '%') OR LOWER(skills) LIKE CONCAT('%', LOWER(:skills), '%'))")
    int countJobsPaginated(
              @Bind("category") String category,
              @Bind("search") String search,
              @Bind("location") String location,
              @Bind("jobType") String jobType,
              @Bind("skills") String skills);

    @SqlQuery("SELECT " + COLS + "FROM jobs WHERE recruiter_id = :recruiterId ORDER BY posted_on DESC")
    List<Job> getJobsByRecruiter(@Bind("recruiterId") int recruiterId);

    @SqlQuery("SELECT " + COLS + "FROM jobs WHERE id = :id LIMIT 1")
    Optional<Job> getJobById(@Bind("id") int id);

    @SqlUpdate("INSERT INTO jobs (title, company, location, apply_link, category, description, salary, type, recruiter_id, " +
               "last_date_to_apply, experience_required, education_required, skills, work_mode) " +
               "VALUES (:title, :company, :location, :applyLink, :category, :description, :salary, :type, :recruiterId, " +
               ":lastDateToApply, :experienceRequired, :educationRequired, :skills, :workMode)")
    @GetGeneratedKeys
    int insertJob(@Bind("title") String title, @Bind("company") String company,
                  @Bind("location") String location, @Bind("applyLink") String applyLink,
                  @Bind("category") String category, @Bind("description") String description,
                  @Bind("salary") String salary, @Bind("type") String type,
                  @Bind("recruiterId") int recruiterId,
                  @Bind("lastDateToApply") String lastDateToApply, @Bind("experienceRequired") String experienceRequired,
                  @Bind("educationRequired") String educationRequired, @Bind("skills") String skills, @Bind("workMode") String workMode);

    /**
     * Inserts a job only if a job with the same apply_link doesn't already exist.
     * Used by the sync service to avoid duplicates when called multiple times.
     * Returns generated ID (> 0) if inserted, or 0 if already exists.
     */
    @SqlUpdate("INSERT INTO jobs (title, company, location, apply_link, category, description, salary, type, recruiter_id, posted_on, " +
               "last_date_to_apply, experience_required, education_required, skills, work_mode) " +
               "SELECT :title, :company, :location, :applyLink, :category, :description, :salary, :type, :recruiterId, " +
               "STR_TO_DATE(:postedOn, '%d/%m/%Y %H:%i'), :lastDateToApply, :experienceRequired, :educationRequired, :skills, :workMode " +
               "FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE apply_link = :applyLink)")
    @GetGeneratedKeys
    int insertJobIfNotExists(@Bind("title") String title, @Bind("company") String company,
                             @Bind("location") String location, @Bind("applyLink") String applyLink,
                             @Bind("category") String category, @Bind("description") String description,
                             @Bind("salary") String salary, @Bind("type") String type,
                             @Bind("recruiterId") int recruiterId, @Bind("postedOn") String postedOn,
                             @Bind("lastDateToApply") String lastDateToApply, @Bind("experienceRequired") String experienceRequired,
                             @Bind("educationRequired") String educationRequired, @Bind("skills") String skills, @Bind("workMode") String workMode);

    @SqlUpdate("UPDATE jobs SET title=:title, company=:company, location=:location, apply_link=:applyLink, " +
               "category=:category, description=:description, salary=:salary, type=:type, " +
               "last_date_to_apply=:lastDateToApply, experience_required=:experienceRequired, " +
               "education_required=:educationRequired, skills=:skills, work_mode=:workMode " +
               "WHERE id=:id AND recruiter_id=:recruiterId")
    int updateJob(@Bind("id") int id, @Bind("title") String title, @Bind("company") String company,
                  @Bind("location") String location, @Bind("applyLink") String applyLink,
                  @Bind("category") String category, @Bind("description") String description,
                  @Bind("salary") String salary, @Bind("type") String type, @Bind("recruiterId") int recruiterId,
                  @Bind("lastDateToApply") String lastDateToApply, @Bind("experienceRequired") String experienceRequired,
                  @Bind("educationRequired") String educationRequired, @Bind("skills") String skills, @Bind("workMode") String workMode);

    @SqlUpdate("DELETE FROM jobs WHERE id=:id AND recruiter_id=:recruiterId")
    int deleteJob(@Bind("id") int id, @Bind("recruiterId") int recruiterId);

    // Stats queries
    @SqlQuery("SELECT COUNT(*) FROM jobs")
    int countJobs();

    @SqlQuery("SELECT COUNT(*) FROM users WHERE role='CANDIDATE'")
    int countCandidates();

    @SqlQuery("SELECT COUNT(*) FROM experiences")
    int countExperiences();

    @SqlQuery("SELECT category, COUNT(*) as cnt FROM jobs GROUP BY category")
    @KeyColumn("category")
    @ValueColumn("cnt")
    java.util.Map<String, Integer> jobsByCategory();
}
