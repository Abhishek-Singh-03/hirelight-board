package com.hirelight.db;

import com.hirelight.api.Job;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.List;

@RegisterBeanMapper(Job.class)
public interface UserJobDao {

    @SqlUpdate("INSERT INTO user_jobs (user_id, job_id, status) VALUES (:userId, :jobId, :status) " +
               "ON DUPLICATE KEY UPDATE status = :status")
    int insertOrUpdateStage(@Bind("userId") int userId, @Bind("jobId") int jobId, @Bind("status") String status);

    @SqlQuery("SELECT CAST(j.id AS CHAR) as id, j.title, j.company, j.location, j.apply_link as applyLink, " +
              "DATE_FORMAT(j.posted_on, '%d/%m/%Y %H:%i') as postedOn, j.category, j.description, j.salary, j.type, uj.status " +
              "FROM jobs j " +
              "JOIN user_jobs uj ON j.id = uj.job_id " +
              "WHERE uj.user_id = :userId AND uj.status != 'PASSED' " +
              "ORDER BY uj.updated_at DESC")
    List<Job> getUserTrackedJobs(@Bind("userId") int userId);

    @SqlQuery("SELECT job_id FROM user_jobs WHERE user_id = :userId")
    List<Integer> getSwipedJobIds(@Bind("userId") int userId);

    @SqlUpdate("DELETE FROM user_jobs WHERE user_id = :userId AND job_id = :jobId")
    int deleteTrackedJob(@Bind("userId") int userId, @Bind("jobId") int jobId);
}
