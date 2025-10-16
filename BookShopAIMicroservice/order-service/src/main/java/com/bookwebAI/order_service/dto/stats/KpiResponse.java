// dto/stats/KpiResponse.java
package com.bookwebAI.order_service.dto.stats;

import lombok.*;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class KpiResponse {
    private long orders;            // tổng đơn
    private long paidOrders;        // đơn đã thanh toán (payment_status=true)
    private long completedOrders;   // đơn COMPLETED
    private long cancelledOrders;   // đơn CANCELLED
    private long buyers;            // khác buyerId (ước lượng khách hàng)
    private long items;             // tổng sản phẩm bán ra
    private long revenue;           // doanh thu (đã snapshot) -> sum(order.total) theo quy tắc bên dưới
    private double aov;             // average order value (revenue / completedOrders)
    private double conversion;      // tỉ lệ paidOrders / orders
}
