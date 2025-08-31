# Start with a base image with Java and Maven
FROM maven:3.8.6-openjdk-21 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean install -DskipTests

# Final stage: Create a lightweight image
FROM openjdk:21-slim

# Expose the application port
EXPOSE 8080

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/backend-app.jar .

# Set environment variables from application.properties
# These will need to be configured on Render for production use
# They are included here for reference
ENV SPRING_APPLICATION_NAME=budget-tracker
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/infosys
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=123456
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
ENV SPRING_JPA_SHOW_SQL=true
ENV SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
ENV SPRING_JWT_SECRET=2095c59ea042e9540c6f5e4427becb1958ae27823e665ed04168b67e151612fd
ENV SPRING_JWT_EXPIRATION_MS=18000000

# Run the application
ENTRYPOINT ["java", "-jar", "backend-app.jar"]