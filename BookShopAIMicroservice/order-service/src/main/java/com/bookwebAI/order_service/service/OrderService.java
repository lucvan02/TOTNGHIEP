package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.UserClient;
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


@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final BookClient bookClient;

    // NEW
    private final VNPayRefundService vnpayRefundService;

    @Transactional
    public List<Order> listAll(@Nullable String status) {
        if (status == null || status.isBlank()) return orderRepo.findAllByOrderByCreatedAtDesc();
        return orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.valueOf(status.toUpperCase()));
    }

    @Transactional
    public Order get(String orderId) {
        return orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }

//    @Transactional
//    public Order updateStatus(String orderId, UpdateStatusRequest req) {
//        Order o = get(orderId);
//        OrderStatus s = OrderStatus.valueOf(req.getStatus().toUpperCase());
//        if (s == OrderStatus.CANCELLED) {
//            o.setCancelReason(req.getCancelReason());
//        }
//        o.setStatus(s);
//        o.setUpdatedAt(LocalDateTime.now());
//        return orderRepo.save(o);
//    }


    @Transactional
    public Order updateStatus(String orderId, UpdateStatusRequest req) {
        Order o = get(orderId);
        OrderStatus next = OrderStatus.valueOf(req.getStatus().toUpperCase());

        //nếu chuyển sang pending thì set createdAt lại
        if (next == OrderStatus.PENDING) {
            o.setCreatedAt(LocalDateTime.now());
            // giữ nguyên updatedAt để thể hiện thời điểm cập nhật trạng thái
        }

        if (next == OrderStatus.CANCELLED) {
            // chỉ cho hủy khi chưa hoàn tất
            if (o.getStatus() == OrderStatus.COMPLETED)
                throw new IllegalStateException("Không thể hủy đơn đã hoàn thành.");

            o.setCancelReason(req.getCancelReason());

            // trả kho
            for (var it : o.getItems()) {
                bookClient.decreaseStock(it.getBookId(), it.getQuantity() * -1);
            }

            // ✅ tự động hoàn tiền nếu đã thanh toán ONLINE
            if (Boolean.TRUE.equals(o.getPaymentStatus())
                    && o.getPaymentMethod() == com.bookwebAI.order_service.entity.enums.PaymentMethod.ONLINE) {
                boolean ok = vnpayRefundService.refundFull(o, "Cancel order " + o.getId());
                System.out.println("[VNPay][REFUND][AUTO] order=" + o.getId() + " result=" + ok);
//                if (ok) {
//                    // tuỳ chính sách: set về false để thể hiện tiền đã hoàn
//                    o.setPaymentStatus(false);
//                }
            }
        }

        o.setStatus(next);
        o.setUpdatedAt(java.time.LocalDateTime.now());
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
