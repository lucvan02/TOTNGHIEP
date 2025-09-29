package com.bookwebAI.book_service.entity;
import jakarta.persistence.*;
import lombok.*;

//@Entity
//@Table(name = "receipt_details")
//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class ReceiptDetail {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private int quantity;
//    private int price;
//
//    @ManyToOne
//    @JoinColumn(name = "receipt_id")
//    private Receipt receipt;
//
//    @ManyToOne
//    @JoinColumn(name = "book_id")
//    private Book book;
//}


@Entity
@Table(name = "receipt_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiptDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;
    private Double importPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    private Receipt receipt;
}
