package com.bookwebAI.order_service.entity;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String code;
    private String buyerId; // users.uid (String)


    @Enumerated(EnumType.STRING)
    private OrderStatus status;


    private Integer shippingFee;
    private String receiveName;
    private String receivePhone;
    private String receiveAddress;
    private String note;
    private String cancelReason;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

}
