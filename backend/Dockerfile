FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/hirelight-backend-1.0-SNAPSHOT.jar ./app.jar
COPY config.yml .
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "server", "config.yml"]
