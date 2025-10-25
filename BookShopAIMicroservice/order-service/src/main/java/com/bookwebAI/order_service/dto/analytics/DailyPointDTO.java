package com.bookwebAI.order_service.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class DailyPointDTO {
    private String day;   // yyyy-MM-dd
    private long orders;  // số đơn tạo trong ngày (mọi trạng thái)
    private int revenue;  // doanh thu trong ngày (SUM total của COMPLETED)
}
