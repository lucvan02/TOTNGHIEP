//package com.bookwebAI.api_gateway.controller;
//
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController("fallbackController")
//public class FallbackController {
//
//    @GetMapping("/auth-fallback")
//    public String authServiceFallback() {
//        return "Authentication service is currently unavailable. Please try again later.";
//    }
//
//    @GetMapping("/user-fallback")
//    public String userServiceFallback() {
//        return "User service is currently unavailable. Please try again later.";
//    }
//
//    @GetMapping("/book-fallback")
//    public String bookServiceFallback() {
//        return "Book service is currently unavailable. Please try again later.";
//    }
//
//    @GetMapping("/order-fallback")
//    public String orderServiceFallback() {
//        return "Order service is currently unavailable. Please try again later.";
//    }
//}