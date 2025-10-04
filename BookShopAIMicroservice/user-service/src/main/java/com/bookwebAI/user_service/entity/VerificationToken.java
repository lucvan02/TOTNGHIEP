package com.bookwebAI.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;             // mã xác thực
    private LocalDateTime expiryDate; // thời hạn sử dụng

    @Column(nullable = false)
    private String email; // gắn với email user

    public static VerificationToken create(String email) {
        return VerificationToken.builder()
                .token(UUID.randomUUID().toString())
                .email(email)
                .expiryDate(LocalDateTime.now().plusMinutes(15)) // 15 phút
                .build();
    }

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDateTime.now());
    }
}
