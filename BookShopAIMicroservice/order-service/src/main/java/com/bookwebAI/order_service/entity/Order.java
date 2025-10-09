package com.bookwebAI.order_service.entity;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

//@Getter @Setter
//@NoArgsConstructor @AllArgsConstructor @Builder
//@Entity @Table(name = "orders")
//public class Order {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//
//    private String code;
//    private String buyerId; // users.uid (String)
//
//
//    @Enumerated(EnumType.STRING)
//    private OrderStatus status;
//
//
//    private Integer shippingFee;
//    private String receiveName;
//    private String receivePhone;
//    private String receiveAddress;
//    private String note;
//    private String cancelReason;
//
//
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonManagedReference
//    @Builder.Default
//    private List<OrderItem> items = new ArrayList<>();
//
//}


//
//@Getter @Setter
//@NoArgsConstructor @AllArgsConstructor @Builder
//@Entity @Table(name = "orders", indexes = {
//        @Index(name="idx_orders_buyer_status", columnList = "buyerId,status")
//})
//public class Order {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, updatable = false)
//    private String code;                     // UUID string, set khi checkout
//
//    private String buyerId;
//
//    @Enumerated(EnumType.STRING)
//    private OrderStatus status;
//
//    @Enumerated(EnumType.STRING)
//    private PaymentMethod paymentMethod;     // COD / ONLINE
//
//    private Integer shippingFee;
//    private Integer total;                   // tổng tiền của đơn (items + ship)
//
//    private String receiveName;
//    private String receivePhone;
//    private String receiveAddress;
//    private String note;
//    private String cancelReason;
//
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonManagedReference
//    @Builder.Default
//    private List<OrderItem> items = new ArrayList<>();
//}








@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "orders", indexes = {
        @Index(name="idx_orders_buyer_status", columnList = "buyerId,status")
})
public class Order {

    // ⬇⬇⬇ UUID làm khoá chính và là “mã đơn” luôn
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    private String buyerId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // COD | ONLINE

    private Boolean paymentStatus;       // true = đã thanh toán, false = chưa

    private Integer shippingFee;
    private Integer total;               // tổng tiền (items + ship)

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