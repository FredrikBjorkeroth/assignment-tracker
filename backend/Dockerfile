FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
COPY src ./src

RUN ./gradlew bootJar --no-daemon

EXPOSE 8080

CMD ["sh", "-c", "java -jar $(ls build/libs/*.jar | grep -v plain)"]
