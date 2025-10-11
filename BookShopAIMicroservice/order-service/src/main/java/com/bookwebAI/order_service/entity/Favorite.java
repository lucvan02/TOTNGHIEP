package com.bookwebAI.order_service.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name="favorites",
        uniqueConstraints = @UniqueConstraint(name="uk_fav_buyer_book", columnNames={"buyer_id","book_id"}))
public class Favorite {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="buyer_id", nullable=false, length=64)
    private String buyerId;

    @Column(name="book_id", nullable=false)
    private Long bookId;

    // snapshot cho hiển thị nhanh
    @Column(nullable=false, length=255)
    private String bookTitle;
    private String bookImage;
    private Long price;

    private LocalDateTime createdAt;
}
