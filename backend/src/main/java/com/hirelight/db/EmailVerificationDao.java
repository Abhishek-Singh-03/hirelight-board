package com.hirelight.db;

import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.Optional;

public interface EmailVerificationDao {

    @SqlUpdate("INSERT INTO email_verification_tokens (user_id, token, expires_at) " +
               "VALUES (:userId, :token, DATE_ADD(NOW(), INTERVAL 24 HOUR))")
    void saveVerificationToken(@Bind("userId") int userId, @Bind("token") String token);

    @SqlQuery("SELECT user_id FROM email_verification_tokens " +
              "WHERE token = :token AND expires_at > NOW() LIMIT 1")
    Optional<Integer> findUserIdByToken(@Bind("token") String token);

    @SqlUpdate("DELETE FROM email_verification_tokens WHERE token = :token")
    void deleteToken(@Bind("token") String token);

    @SqlUpdate("DELETE FROM email_verification_tokens WHERE user_id = :userId")
    void deleteAllForUser(@Bind("userId") int userId);
}
