package com.bookwebAI.auth_service.service;

import com.bookwebAI.auth_service.dto.LoginRequest;
import com.bookwebAI.auth_service.dto.RegisterRequest;
import com.bookwebAI.auth_service.dto.UserDTO;
import com.bookwebAI.auth_service.entity.User;
import com.bookwebAI.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserDTO register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullname(request.getFullname())
                .role("USER")
                .active(true)
                .build();

        userRepository.save(user);

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .role(user.getRole())
                .build();
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtService.generateToken(user);
    }

    public String loginWithGoogle(String idToken) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        Map<String, String> res = restTemplate.getForObject(url, Map.class);
        String email = res.get("email");
        String name = res.get("name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(email)
                        .email(email)
                        .fullname(name)
                        .password("GOOGLE_LOGIN")
                        .role("USER")
                        .active(true)
                        .build()));

        return jwtService.generateToken(user);
    }

    public UserDTO getUserInfo(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .role(user.getRole())
                .build();
    }
}
