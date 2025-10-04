package com.bookwebAI.user_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private String message; // mô tả hoặc thông báo
    private T data;         // dữ liệu chính trả về
}
