package com.bookwebAI.user_service.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangePasswordDto {
    private String oldPassword;
    private String newPassword;
}