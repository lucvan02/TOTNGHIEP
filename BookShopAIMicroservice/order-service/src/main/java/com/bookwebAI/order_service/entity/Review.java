package com.bookwebAI.order_service.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;


@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "reviews")
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;


    private Integer star; // 1..5
    @Column(columnDefinition = "TEXT")
    private String comment;
    private LocalDateTime createdAt;
}