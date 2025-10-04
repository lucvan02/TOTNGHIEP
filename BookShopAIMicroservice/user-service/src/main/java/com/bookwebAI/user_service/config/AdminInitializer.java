package com.bookwebAI.user_service.config;

import com.bookwebAI.user_service.entity.User;
import com.bookwebAI.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .uid(UUID.randomUUID())
                    .username("admin")
                    .password(encoder.encode("admin"))
                    .email("admin@bookweb.local")
                    .firstname("System")
                    .lastname("Admin")
                    .phone("0000000000")
                    .role("ADMIN")
                    .active(true)
                    .provider("LOCAL")
                    .build();

            userRepo.save(admin);
            System.out.println("✅ Admin account created: username=admin / password=admin");
        } else {
            System.out.println("ℹ️ Admin account already exists, skipping creation.");
        }
    }
}
