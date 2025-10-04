package com.bookwebAI.user_service.dto;

import lombok.Data;

@Data
public class UserRegisterDto {
    private String username;
    private String password;
    private String email;
    private String firstname;
    private String lastname;
    private String phone;
}
