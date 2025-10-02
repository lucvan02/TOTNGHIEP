//package com.bookwebAI.api_gateway.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.reactive.CorsWebFilter;
//import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
//
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public CorsWebFilter corsWebFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//        // Chỉ cho phép FE gọi (React chạy trên Vite port 5173)
//        config.addAllowedOrigin("*");
//
//        // Hoặc nếu muốn hỗ trợ nhiều origin → dùng allowedOriginPatterns thay vì addAllowedOrigin
//        // config.addAllowedOriginPattern("*");
//
//        config.addAllowedMethod("*");  // GET, POST, PUT, DELETE, OPTIONS
//        config.addAllowedHeader("*");  // Cho phép tất cả header
//        config.setAllowCredentials(true); // Cho phép gửi cookie/token
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//
//        return new CorsWebFilter(source);
//    }
//}
