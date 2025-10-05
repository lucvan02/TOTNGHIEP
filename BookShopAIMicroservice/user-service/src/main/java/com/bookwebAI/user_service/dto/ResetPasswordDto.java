package com.bookwebAI.user_service.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResetPasswordDto {
    private String email;
    private String otp;
    private String newPassword;
}