package com.hirelight.db;

import com.hirelight.api.Salary;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import java.util.List;

@RegisterBeanMapper(Salary.class)
public interface SalaryDao {
    @SqlQuery("SELECT id, company, role, yoe, base_salary as baseSalary, bonus, stock, " +
              "DATE_FORMAT(created_at, '%b %d, %Y') as date " +
              "FROM salaries ORDER BY company, yoe ASC")
    List<Salary> getAllSalaries();

    @SqlUpdate("INSERT INTO salaries (company, role, yoe, base_salary, bonus, stock, author_id) " +
               "VALUES (:company, :role, :yoe, :baseSalary, :bonus, :stock, :authorId)")
    @GetGeneratedKeys
    int insertSalary(@Bind("company") String company, @Bind("role") String role, 
                     @Bind("yoe") int yoe, @Bind("baseSalary") int baseSalary, 
                     @Bind("bonus") int bonus, @Bind("stock") int stock, 
                     @Bind("authorId") Integer authorId);
}
