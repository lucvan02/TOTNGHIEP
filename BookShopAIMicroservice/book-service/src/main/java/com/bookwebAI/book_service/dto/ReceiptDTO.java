package com.bookwebAI.book_service.dto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class ReceiptDTO {
//    private Long id;
//    private LocalDate createdAt;
//    private List<ReceiptDetailDTO> details;
//}


@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiptDTO {
    private Long id;
    private LocalDateTime createdAt;
    private Double total;
    private List<ReceiptDetailDTO> receiptDetails;
}
