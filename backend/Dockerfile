FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY gradlew ./
COPY gradle ./gradle
RUN ./gradlew --version --no-daemon

COPY build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon > /dev/null

COPY src ./src

RUN ./gradlew bootJar --no-daemon

EXPOSE 7310

CMD ["sh", "-c", "java -jar $(ls build/libs/*.jar | grep -v plain)"]
