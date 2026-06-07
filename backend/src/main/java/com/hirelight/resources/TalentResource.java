package com.hirelight.resources;

import com.hirelight.db.UserDao;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/talent")
@Produces(MediaType.APPLICATION_JSON)
public class TalentResource {

    private final UserDao userDao;

    public TalentResource(UserDao userDao) {
        this.userDao = userDao;
    }

    @GET
    public Response getCandidates() {
        return Response.ok(userDao.getAllCandidates()).build();
    }

    @GET
    @Path("/{id}")
    public Response getCandidateById(@PathParam("id") int id) {
        return Response.ok(userDao.getUserById(id)).build();
    }
}
