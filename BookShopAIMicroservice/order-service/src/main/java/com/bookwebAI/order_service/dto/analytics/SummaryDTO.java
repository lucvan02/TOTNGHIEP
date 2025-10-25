package com.bookwebAI.order_service.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data @AllArgsConstructor
public class SummaryDTO {
    private long ordersCount;      // tổng số đơn (mọi trạng thái)
    private long paidOrdersCount;  // số đơn đã thanh toán
    private long completedCount;   // số đơn COMPLETED
    private long cancelledCount;   // số đơn CANCELLED
    private long pendingCount;     // số đơn PENDING
    private int revenue;           // doanh thu (chỉ tính COMPLETED)
    private int avgOrderValue;     // = revenue / completedCount (0 nếu chia 0)
    private Map<String, Long> byStatus; // map trạng thái
}
