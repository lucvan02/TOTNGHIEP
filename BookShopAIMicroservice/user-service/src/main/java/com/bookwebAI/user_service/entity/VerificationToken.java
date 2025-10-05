package com.bookwebAI.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "verification_tokens")
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String otp;
    private LocalDateTime expiryDate;

    public static VerificationToken create(String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        return VerificationToken.builder()
                .email(email)
                .otp(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .build();
    }

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDateTime.now());
    }
}
