package com.bookwebAI.order_service.entity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

//@Getter @Setter
//@NoArgsConstructor @AllArgsConstructor @Builder
//@Entity
//@Table(name = "order_items",
//        uniqueConstraints = @UniqueConstraint(name = "uk_order_book", columnNames = {"order_id", "bookId"}))
//public class OrderItem {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id")
//    @JsonBackReference
//    private Order order;
//
//
//    private Long bookId;
//    private String bookTitle;
//    private String bookImage;
//    private Integer price; // snapshot price
//    private Integer quantity;
//    private Integer total; // price * quantity
//    private Boolean hasReview;
//}



@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "order_items",
        uniqueConstraints = @UniqueConstraint(name = "uk_order_book", columnNames = {"order_id", "bookId"}))
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, columnDefinition = "char(36)") // FK tới UUID
    @JsonBackReference
    private Order order;

    private Long bookId;
    private String bookTitle;
    private String bookImage;
    private Integer price;
    private Integer quantity;
    private Integer total;
    private Boolean hasReview;
}