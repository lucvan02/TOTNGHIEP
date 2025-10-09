package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;



//public interface OrderRepository extends JpaRepository<Order, Long> {
//    Optional<Order> findByBuyerIdAndStatus(String buyerId, OrderStatus status);
//    Optional<Order> findByCode(String code);
//}


//// domain/repository/OrderRepository.java
//public interface OrderRepository extends JpaRepository<Order, Long> {
//    Optional<Order> findByBuyerIdAndStatus(String buyerId, OrderStatus status);
//    Optional<Order> findByCode(String code);
//
//    @Query("select o from Order o where o.buyerId = :buyerId and o.status <> 'CART' order by o.createdAt desc")
//    List<Order> historyOf(@Param("buyerId") String buyerId);
//
//    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
//    List<Order> findAllByOrderByCreatedAtDesc();
//}


public interface OrderRepository extends JpaRepository<Order, String> { // ⬅ String (UUID)

    Optional<Order> findByBuyerIdAndStatus(String buyerId, OrderStatus status);

    @Query("select o from Order o where o.buyerId = :buyerId and o.status <> 'CART' order by o.createdAt desc")
    List<Order> historyOf(@Param("buyerId") String buyerId);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();
}
