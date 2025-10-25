package com.bookwebAI.order_service.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class TopBookDTO {
    private Long bookId;
    private String title;
    private long quantity; // tổng số lượng đã bán (COMPLETED)
    private int revenue;   // doanh thu từ sách đó (COMPLETED)
}
