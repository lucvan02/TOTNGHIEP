package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByBuyerIdAndStatus(String buyerId, OrderStatus status);
    Optional<Order> findByCode(String code);
}