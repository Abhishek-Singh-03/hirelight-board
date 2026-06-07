package com.hirelight.resources;

import com.hirelight.api.Salary;
import com.hirelight.core.User;
import com.hirelight.db.SalaryDao;
import io.dropwizard.auth.Auth;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/salaries")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SalaryResource {

    private final SalaryDao salaryDao;

    public SalaryResource(SalaryDao salaryDao) {
        this.salaryDao = salaryDao;
    }

    @GET
    public List<Salary> getAllSalaries() {
        return salaryDao.getAllSalaries();
    }

    @POST
    public Response createSalary(@Auth User user, Salary salary) {
        if (salary.getCompany() == null || salary.getCompany().trim().isEmpty()) {
            return Response.status(400).entity("{\"error\":\"Company is required.\"}").build();
        }
        if (salary.getRole() == null || salary.getRole().trim().isEmpty()) {
            return Response.status(400).entity("{\"error\":\"Role is required.\"}").build();
        }
        if (salary.getBaseSalary() <= 0) {
            return Response.status(400).entity("{\"error\":\"Base salary must be greater than 0.\"}").build();
        }

        Integer authorId = user.getId(); // We'll just default to anonymous if we want, or record it. 
        // Let's actually always store it anonymously for now to encourage people to share without fear.
        // Or if we add an anonymous flag like experiences:
        // Integer authorId = salary.isAnonymous() ? null : user.getId();
        
        // For salary, usually 100% anonymous is safest for the user. We'll set authorId to null.
        authorId = null;

        salaryDao.insertSalary(
            salary.getCompany().trim(),
            salary.getRole().trim(),
            salary.getYoe(),
            salary.getBaseSalary(),
            salary.getBonus(),
            salary.getStock(),
            authorId
        );

        return Response.status(201).build();
    }
}
