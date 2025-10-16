package com.bookwebAI.order_service.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse<T> {
    private String message;
    private T data;

    public ApiResponse(String message, T data) { this.message = message; this.data = data; }
}