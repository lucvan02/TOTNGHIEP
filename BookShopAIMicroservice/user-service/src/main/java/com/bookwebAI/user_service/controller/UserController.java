package com.bookwebAI.user_service.controller;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.entity.User;
import com.bookwebAI.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService service;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody UserRegisterDto dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return ResponseEntity.ok(service.verifyOtp(email, otp));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody UserLoginDto dto) {
        return ResponseEntity.ok(service.login(dto));
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginGoogle(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(service.loginWithGoogle(req.get("code")));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String email) {
        return ResponseEntity.ok(service.resendOtp(email));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestParam String username,
            @RequestBody ChangePasswordDto dto) {
        return ResponseEntity.ok(service.changePassword(username, dto));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@RequestParam String username) {
        return ResponseEntity.ok(service.getProfile(username));
    }
}
