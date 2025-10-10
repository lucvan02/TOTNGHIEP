package com.bookwebAI.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


//@Getter @Setter
//@NoArgsConstructor @AllArgsConstructor @Builder
//@Entity @Table(name = "reviews")
//public class Review {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_item_id")
//    private OrderItem orderItem;
//
//
//    private Integer star; // 1..5
//    @Column(columnDefinition = "TEXT")
//    private String comment;
//    private LocalDateTime createdAt;
//}






import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(name="uk_review_orderitem", columnNames={"order_item_id"}))
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;           // 1-1: mỗi item chỉ review 1 lần

    private String buyerId;                // để lọc theo người mua
    private Long bookId;                   // để lọc theo sách

    // 👇 thêm
    @Column(length = 150)
    private String buyerName;          // tên hiển thị tại thời điểm review
    @Column(length = 2550)
    private String buyerAvatar;        // url avatar (có thể null)

    @Column(nullable = false)  private Integer stars;   // 1..5
    @Column(columnDefinition = "text") private String comment;

    private LocalDateTime createdAt;
}
