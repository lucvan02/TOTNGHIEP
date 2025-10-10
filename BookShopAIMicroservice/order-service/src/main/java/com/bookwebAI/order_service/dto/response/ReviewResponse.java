package com.bookwebAI.order_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class ReviewResponse {
    private Long id;
    private Long orderItemId;
    private Long bookId;
    private String buyerId;

    private String buyerName;     // 👈 thêm
    private String buyerAvatar;   // 👈 thêm

    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
    private String bookTitle;
    private String bookImage;
}
