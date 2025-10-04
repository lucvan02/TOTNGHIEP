package com.bookwebAI.user_service.dto;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String firstname;
    private String lastname;
    private String phone;
    private String avatar;
}
