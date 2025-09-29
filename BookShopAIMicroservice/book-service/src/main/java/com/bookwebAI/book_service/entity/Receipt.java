package com.bookwebAI.book_service.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

//@Entity
//@Table(name = "receipts")
//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class Receipt {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private LocalDate createdAt;
//
//    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL)
//    private List<ReceiptDetail> details = new ArrayList<>();
//}


@Entity
@Table(name = "receipts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    private Double total; // tổng tiền

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReceiptDetail> details = new ArrayList<>();
}
