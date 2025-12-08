package com.bookwebAI.user_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class UserResponseDto {
    private UUID uid;
    private String username;
    private String email;
    private String firstname;
    private String lastname;
    private String phone;
    private String avatar;
    private String role;
    private boolean active;
}
