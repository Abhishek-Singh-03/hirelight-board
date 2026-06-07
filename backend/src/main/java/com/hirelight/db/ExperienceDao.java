package com.hirelight.db;

import com.hirelight.api.Experience;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.List;

@RegisterBeanMapper(Experience.class)
public interface ExperienceDao {
    @SqlQuery("SELECT CAST(e.id AS CHAR) as id, e.job_title as jobTitle, e.company, e.content as text, e.type, e.upvotes, e.share_code as shareCode, " +
              "DATE_FORMAT(e.created_at, '%b %d, %Y') as date, COALESCE(u.name, 'Anonymous') as author " +
              "FROM experiences e LEFT JOIN users u ON e.author_id = u.id ORDER BY e.created_at DESC")
    List<Experience> getAllExperiences();

    @SqlUpdate("UPDATE experiences SET upvotes = upvotes + 1 WHERE id = :id")
    void upvoteExperience(@Bind("id") int id);

    @SqlUpdate("INSERT INTO experiences (job_title, company, content, type, author_id, share_code) VALUES (:jobTitle, :company, :text, :type, :authorId, SUBSTRING(MD5(RAND()), 1, 6))")
    @GetGeneratedKeys
    int insertExperience(@Bind("jobTitle") String jobTitle, @Bind("company") String company,
                         @Bind("text") String text, @Bind("type") String type,
                         @Bind("authorId") Integer authorId); // Integer (not int) so null is allowed for anonymous posts
}
