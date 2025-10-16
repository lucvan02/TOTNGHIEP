// dto/stats/TopBook.java
package com.bookwebAI.order_service.dto.stats;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class TopBook {
    private Long bookId;
    private String title;   // merge từ book-service (live)
    private String image;   // merge từ book-service (live)
    private long qty;       // số lượng đã bán
    private long revenue;   // doanh thu từ sách (sum price*qty ở order_item)
}