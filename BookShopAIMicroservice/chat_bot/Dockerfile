# be/image_service/Dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy toàn bộ source vào container
COPY . .

# Build project Spring Boot (dùng Maven wrapper nếu có)
RUN mvn clean package -DskipTests

# Giai đoạn chạy: dùng image nhẹ chỉ có JRE
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Copy file jar đã build từ giai đoạn builder
COPY --from=builder /app/target/*.jar app.jar

# Mở cổng mặc định của Spring Boot
EXPOSE 9000

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
