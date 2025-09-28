package com.bookwebAI.auth_service.controller;

import com.bookwebAI.auth_service.dto.LoginRequest;
import com.bookwebAI.auth_service.dto.RegisterRequest;
import com.bookwebAI.auth_service.dto.UserDTO;
import com.bookwebAI.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")

@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

//    @PostMapping("/google")
//    public ResponseEntity<String> loginGoogle(@RequestBody GoogleTokenRequest request) {
//        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
//    }

    //them api lay thong tin user
    @GetMapping("/user/{username}")
    public ResponseEntity<UserDTO> getUserInfo(@PathVariable String username) {
        UserDTO userDTO = authService.getUserInfo(username);
        return ResponseEntity.ok(userDTO);

    }

}
