package com.hirelight;

import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.AuthValueFactoryProvider;
import io.dropwizard.auth.oauth.OAuthCredentialAuthFilter;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import com.hirelight.core.User;
import com.hirelight.auth.HireLightAuthorizer;
import com.hirelight.auth.JwtAuthenticator;
import com.hirelight.auth.RateLimitFilter;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterRegistration;
import java.util.EnumSet;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.db.DataSourceFactory;
import org.jdbi.v3.core.Jdbi;
import io.dropwizard.jdbi3.JdbiFactory;
import com.hirelight.db.JobDao;
import com.hirelight.db.ExperienceDao;
import com.hirelight.db.UserDao;
import com.hirelight.db.SalaryDao;
import com.hirelight.db.UserJobDao;
import com.hirelight.db.PasswordResetDao;
import com.hirelight.db.EmailVerificationDao;
import com.hirelight.db.BlogDao;
import com.hirelight.resources.AuthResource;
import com.hirelight.resources.ExperienceResource;
import com.hirelight.resources.TalentResource;
import com.hirelight.resources.SalaryResource;
import com.hirelight.resources.PasswordResetResource;

public class HireLightApplication extends Application<HireLightConfiguration> {

    public static void main(final String[] args) throws Exception {
        new HireLightApplication().run(args);
    }

    @Override
    public String getName() {
        return "hirelight-backend";
    }

    @Override
    public void initialize(final Bootstrap<HireLightConfiguration> bootstrap) {
        bootstrap.setConfigurationSourceProvider(
            new SubstitutingSourceProvider(
                bootstrap.getConfigurationSourceProvider(),
                new EnvironmentVariableSubstitutor(false)
            )
        );

        bootstrap.addBundle(new MigrationsBundle<HireLightConfiguration>() {
            @Override
            public DataSourceFactory getDataSourceFactory(HireLightConfiguration configuration) {
                return configuration.getDataSourceFactory();
            }
        });
    }

    @Override
    public void run(final HireLightConfiguration configuration, final Environment environment) {

        // --- JDBI DATABASE SETUP ---
        final JdbiFactory factory = new JdbiFactory();
        final Jdbi jdbi = factory.build(environment, configuration.getDataSourceFactory(), "mysql");
        final JobDao jobDao = jdbi.onDemand(JobDao.class);
        final ExperienceDao experienceDao = jdbi.onDemand(ExperienceDao.class);
        final UserDao userDao = jdbi.onDemand(UserDao.class);
        final SalaryDao salaryDao = jdbi.onDemand(SalaryDao.class);
        final UserJobDao userJobDao = jdbi.onDemand(UserJobDao.class);
        final PasswordResetDao passwordResetDao = jdbi.onDemand(PasswordResetDao.class);
        final EmailVerificationDao emailVerificationDao = jdbi.onDemand(EmailVerificationDao.class);
        final BlogDao blogDao = jdbi.onDemand(BlogDao.class);

        // --- ENABLE CORS FOR FRONTEND ---
        final FilterRegistration.Dynamic cors = environment.servlets().addFilter("CORS", CrossOriginFilter.class);
        cors.setInitParameter("allowedOrigins", "*");
        cors.setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin,Authorization");
        cors.setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");
        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        // --- REAL JWT AUTHENTICATION ---
        environment.jersey().register(new AuthDynamicFeature(
            new OAuthCredentialAuthFilter.Builder<User>()
                .setAuthenticator(new JwtAuthenticator())
                .setAuthorizer(new HireLightAuthorizer())
                .setPrefix("Bearer")
                .buildAuthFilter()
        ));
        environment.jersey().register(RolesAllowedDynamicFeature.class);
        environment.jersey().register(new AuthValueFactoryProvider.Binder<>(User.class));
        environment.jersey().register(RateLimitFilter.class);

        // --- REGISTER ALL RESOURCES ---
        environment.jersey().register(new AuthResource(userDao, emailVerificationDao));
        environment.jersey().register(new PasswordResetResource(userDao, passwordResetDao, emailVerificationDao));
        environment.jersey().register(new com.hirelight.resources.JobResource(jobDao, userJobDao));
        environment.jersey().register(new com.hirelight.resources.JobSyncResource(jobDao));
        environment.jersey().register(new com.hirelight.resources.ExperienceResource(experienceDao));
        environment.jersey().register(new com.hirelight.resources.TalentResource(userDao));
        environment.jersey().register(new com.hirelight.resources.SalaryResource(salaryDao));
        environment.jersey().register(new com.hirelight.resources.SitemapResource(jobDao, blogDao));
        environment.jersey().register(new com.hirelight.resources.BlogResource(blogDao));
    }
}
