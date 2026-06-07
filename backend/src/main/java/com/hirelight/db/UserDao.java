package com.hirelight.db;

import com.hirelight.api.UserProfile;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.List;
import java.util.Optional;

@RegisterBeanMapper(UserProfile.class)
public interface UserDao {
    @SqlQuery("SELECT CAST(id AS CHAR) as id, name, role, bio, CAST(skills AS CHAR) as skills FROM users WHERE role = 'CANDIDATE'")
    List<UserProfile> getAllCandidates();

    @SqlQuery("SELECT CAST(id AS CHAR) as id, name, role, bio, CAST(skills AS CHAR) as skills FROM users WHERE id = :id")
    UserProfile getUserById(@Bind("id") int id);

    @SqlQuery("SELECT id, name, email, role, password_hash FROM users WHERE email = :email LIMIT 1")
    Optional<UserProfile> findByEmail(@Bind("email") String email);

    @SqlUpdate("INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :passwordHash, :role)")
    @GetGeneratedKeys
    int insertUser(@Bind("name") String name, @Bind("email") String email,
                   @Bind("passwordHash") String passwordHash, @Bind("role") String role);
}
