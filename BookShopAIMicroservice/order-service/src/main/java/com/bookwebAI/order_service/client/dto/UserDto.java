package com.bookwebAI.order_service.client.dto;

import lombok.Data;

@Data
public class UserDto {
    private String uid;
    private String email;
    private String firstname;
    private String lastname;
    private String avatar;
}