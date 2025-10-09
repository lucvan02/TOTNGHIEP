package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.dto.request.UpdateStatusRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.OrderRepository;

import io.github.resilience4j.core.lang.Nullable;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

//@Service @RequiredArgsConstructor
//public class OrderService {
//    private final OrderRepository orderRepo;
//
//    @Transactional
//    public List<Order> listAll(@Nullable String status) {
//        if (status == null || status.isBlank()) return orderRepo.findAllByOrderByCreatedAtDesc();
//        return orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.valueOf(status.toUpperCase()));
//    }
//
//    @Transactional
//    public Order getByCode(String code) {
//        return orderRepo.findByCode(code).orElseThrow(() -> new RuntimeException("Order not found"));
//    }
//
//    @Transactional
//    public Order updateStatus(String code, UpdateStatusRequest req) {
//        Order o = getByCode(code);
//        OrderStatus s = OrderStatus.valueOf(req.getStatus().toUpperCase());
//
//        // một vài luật đơn giản:
//        if (s == OrderStatus.CANCELLED) {
//            o.setCancelReason(req.getCancelReason());
//        }
//        // tuỳ nghiệp vụ: chỉ PAID khi trước đó là PENDING/CONFIRMED
//        o.setStatus(s);
//        o.setUpdatedAt(LocalDateTime.now());
//        return orderRepo.save(o);
//    }
//}



@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;

    @Transactional
    public List<Order> listAll(@Nullable String status) {
        if (status == null || status.isBlank()) return orderRepo.findAllByOrderByCreatedAtDesc();
        return orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.valueOf(status.toUpperCase()));
    }

    @Transactional
    public Order get(String orderId) {
        return orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order updateStatus(String orderId, UpdateStatusRequest req) {
        Order o = get(orderId);
        OrderStatus s = OrderStatus.valueOf(req.getStatus().toUpperCase());
        if (s == OrderStatus.CANCELLED) {
            o.setCancelReason(req.getCancelReason());
        }
        o.setStatus(s);
        o.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(o);
    }

    @Transactional
    public Order setPaymentStatus(String orderId, boolean paid) {
        Order o = get(orderId);
        o.setPaymentStatus(paid);
        o.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(o);
    }
}
