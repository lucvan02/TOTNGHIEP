package com.bookwebAI.book_service.dto.response;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {
//    private int status;     // HTTP status code
    private String message; // thông báo
    private T data;         // dữ liệu trả về
}
