package com.hirelight.db;

import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.Optional;

public interface PasswordResetDao {

    @SqlUpdate("INSERT INTO password_reset_tokens (user_id, token, expires_at) " +
               "VALUES (:userId, :token, DATE_ADD(NOW(), INTERVAL 1 HOUR))")
    void saveResetToken(@Bind("userId") int userId, @Bind("token") String token);

    @SqlQuery("SELECT user_id FROM password_reset_tokens " +
              "WHERE token = :token AND used = FALSE AND expires_at > NOW() LIMIT 1")
    Optional<Integer> findUserIdByToken(@Bind("token") String token);

    @SqlUpdate("UPDATE password_reset_tokens SET used = TRUE WHERE token = :token")
    void markTokenUsed(@Bind("token") String token);

    @SqlUpdate("DELETE FROM password_reset_tokens WHERE user_id = :userId")
    void deleteAllForUser(@Bind("userId") int userId);
}
