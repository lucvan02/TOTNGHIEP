package com.bookwebAI.book_service.dto;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiptDTO {
    private Long id;
    private LocalDate createdAt;
    private List<ReceiptDetailDTO> details;
}

