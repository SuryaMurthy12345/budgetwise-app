# Start with a base image with Java and Maven
FROM maven:3.9.8-eclipse-temurin-21 AS build

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

# Run the application
ENTRYPOINT ["java", "-jar", "backend-app.jar"]