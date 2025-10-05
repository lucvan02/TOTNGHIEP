//package com.bookwebAI.user_service.controller;
//
//import com.bookwebAI.user_service.dto.ApiResponse;
//import com.bookwebAI.user_service.dto.GoogleUserInfo;
//import com.bookwebAI.user_service.entity.User;
//import com.bookwebAI.user_service.repository.UserRepository;
//import com.bookwebAI.user_service.security.JwtUtil;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.util.MultiValueMap;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@RequiredArgsConstructor
//@CrossOrigin
//public class AuthController {
//    private final UserRepository userRepository;
//    private final JwtUtil jwtUtil;
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    @Value("${google.client.id}")
//    private String clientId;
//
//    @Value("${google.client.secret}")
//    private String clientSecret;
//
//    @Value("${google.redirect.uri}")
//    private String redirectUri;
//
//    @PostMapping("/google")
//    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request) {
//        String code = request.get("code");
//
//        try {
//            // 🔹 Đổi code sang access_token
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//
//            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//            body.add("code", code);
//            body.add("client_id", clientId);
//            body.add("client_secret", clientSecret);
//            body.add("redirect_uri", redirectUri);
//            body.add("grant_type", "authorization_code");
//
//            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
//                    "https://oauth2.googleapis.com/token",
//                    HttpMethod.POST,
//                    new HttpEntity<>(body, headers),
//                    Map.class
//            );
//
//            String accessToken = (String) tokenResponse.getBody().get("access_token");
//
//            // 🔹 Lấy thông tin user từ Google
//            String userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + accessToken;
//            GoogleUserInfo googleUser = restTemplate.getForObject(userInfoUrl, GoogleUserInfo.class);
//
//            User user = userRepository.findByEmail(googleUser.getEmail()).orElse(null);
//            if (user == null) {
//                user = User.builder()
//                        .uid(UUID.randomUUID().toString())
//                        .email(googleUser.getEmail())
//                        .firstname(googleUser.getGiven_name())
//                        .lastname(googleUser.getFamily_name())
//                        .avatar(googleUser.getPicture())
//                        .active(true)
//                        .role("USER")
//                        .provider("GOOGLE")
//                        .build();
//                userRepository.save(user);
//            } else if ("LOCAL".equals(user.getProvider())) {
//                user.setProvider("LOCAL+GOOGLE");
//                user.setActive(true);
//                userRepository.save(user);
//            }
//
//            // 🔹 Sinh JWT
//            String jwtToken = jwtUtil.generateToken(user.getUsername() != null
//                    ? user.getUsername() : user.getEmail());
//
//            Map<String, Object> data = new HashMap<>();
//            data.put("accessToken", jwtToken);
//            data.put("user", user);
//
//            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
//                    .message("Đăng nhập Google thành công!")
//                    .data(data)
//                    .build());
//
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", "Google login failed", "details", e.getMessage()));
//        }
//    }
//}
