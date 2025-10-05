package com.bookwebAI.user_service.controller;

import com.bookwebAI.user_service.dto.ApiResponse;
import com.bookwebAI.user_service.dto.GoogleTokenRequest;
import com.bookwebAI.user_service.dto.GoogleUserInfo;
import com.bookwebAI.user_service.entity.User;
import com.bookwebAI.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        System.out.println("📥 Received Google code: " + code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    "https://oauth2.googleapis.com/token",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // ✅ Lấy thông tin user từ Google
            String userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + accessToken;
            GoogleUserInfo googleUser = restTemplate.getForObject(userInfoUrl, GoogleUserInfo.class);

            System.out.println("👤 Google user info: " + googleUser);

            // ✅ Bọc phần lưu user lại cho an toàn
            User user = userRepository.findByEmail(googleUser.getEmail()).orElse(null);
            if (user == null) {
                user = new User();
                user.setUid(UUID.randomUUID().toString());
                user.setEmail(googleUser.getEmail());
                user.setFirstname(googleUser.getGiven_name());
                user.setLastname(googleUser.getFamily_name());
                user.setAvatar(googleUser.getPicture());
                user.setRole("USER");
                user.setActive(true);

                try {
                    user = userRepository.save(user);
                } catch (Exception ex) {
                    // Nếu có race condition (user vừa được insert bởi request khác)
                    user = userRepository.findByEmail(googleUser.getEmail()).orElse(null);
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("accessToken", accessToken);
            data.put("user", user);

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .message("Đăng nhập Google thành công!")
                    .data(data)
                    .build());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Google login failed", "details", e.getMessage()));
        }
    }


}
