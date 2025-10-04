package com.bookwebAI.user_service.controller;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDto>> register(@RequestBody UserRegisterDto dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verify(@RequestParam String token) {
        return ResponseEntity.ok(service.verifyEmail(token));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(service.login(req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgot(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(service.sendResetPassword(req.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> reset(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(service.resetPassword(req.get("token"), req.get("newPassword")));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> me(Authentication auth) {
        return ResponseEntity.ok(service.getProfile(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> update(@RequestBody UserUpdateDto dto, Authentication auth) {
        return ResponseEntity.ok(service.updateProfile(auth.getName(), dto));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePass(@RequestBody Map<String, String> req, Authentication auth) {
        return ResponseEntity.ok(service.changePassword(auth.getName(), req.get("oldPass"), req.get("newPass")));
    }
}
