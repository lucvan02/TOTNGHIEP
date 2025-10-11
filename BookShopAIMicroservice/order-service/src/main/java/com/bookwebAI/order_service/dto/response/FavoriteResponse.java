package com.bookwebAI.order_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class FavoriteResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookImage;
    private Long price;
    private LocalDateTime createdAt;
}
