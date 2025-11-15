//package com.bookwebAI.order_service.service;
//
//import com.bookwebAI.order_service.client.BookClient;
//import com.bookwebAI.order_service.client.UserClient;
//import com.bookwebAI.order_service.client.dto.ApiResponse;
//import com.bookwebAI.order_service.client.dto.BookDto;
//import com.bookwebAI.order_service.dto.request.UpdateStatusRequest;
//import com.bookwebAI.order_service.entity.Order;
//import com.bookwebAI.order_service.entity.OrderItem;
//import com.bookwebAI.order_service.entity.enums.OrderStatus;
//import com.bookwebAI.order_service.repository.OrderItemRepository;
//import com.bookwebAI.order_service.repository.OrderRepository;
//
//import io.github.resilience4j.core.lang.Nullable;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service @RequiredArgsConstructor
//public class AdminOrderService {
//    private final OrderRepository orderRepo;
//    private final BookClient bookClient;
//    private final UserClient userClient;     // NEW
//    private final MailService mailService;   // NEW
//
//    @Transactional
//    public Order updateStatus(String orderId, UpdateStatusRequest req) {
//        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
//        OrderStatus next = OrderStatus.valueOf(req.getStatus().toUpperCase());
//        OrderStatus prev = o.getStatus();
//
//        // Hạn chế hủy: chỉ cho hủy khi chưa hoàn thành
//        if (next == OrderStatus.CANCELLED && (prev == OrderStatus.COMPLETED)) {
//            throw new IllegalStateException("Không thể hủy đơn đã hoàn thành.");
//        }
//
//        // Chuyển trạng thái
//        o.setStatus(next);
//        if (next == OrderStatus.CANCELLED) {
//            o.setCancelReason(req.getCancelReason());
//            // Trả lại tăng KHO tại đây
//            for (OrderItem it : o.getItems()) {
//                bookClient.decreaseStock(it.getBookId(), it.getQuantity()*-1);
//            }
//        }
//        o.setUpdatedAt(LocalDateTime.now());
//        o = orderRepo.save(o);
//
//        // Hành động theo trạng thái
//        if (next == OrderStatus.PENDING) {
//            // TRỪ KHO tại đây
//            for (OrderItem it : o.getItems()) {
//                bookClient.decreaseStock(it.getBookId(), it.getQuantity());
//            }
//        } else if (next == OrderStatus.COMPLETED) {
//            // TĂNG SALE khi hoàn tất
//            for (OrderItem it : o.getItems()) {
//                bookClient.increaseSale(it.getBookId(), it.getQuantity());
//            }
//            //Chuyển trạng thái đã thanh toán
//            o.setPaymentStatus(true);
//        } else if (next == OrderStatus.CANCELLED) {
//            // GỬI EMAIL thông báo hủy
////            var user = userClient.getContact(o.getBuyerId()).getData(); // {email, fullName}
//            var user = userClient.getContact(o.getBuyerId()); // {email, fullName}
//            mailService.sendOrderCancelled(user.getEmail(), user.getFullName(), o.getId(), req.getCancelReason());
//            //in ra console
//            System.out.println("Gửi email hủy đơn tới " + user.getEmail());
//        }
//
//        return o;
//    }
//}





package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.UserClient;
import com.bookwebAI.order_service.dto.request.UpdateStatusRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.enums.PaymentMethod;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class AdminOrderService {
    private final com.bookwebAI.order_service.repository.OrderRepository orderRepo;
    private final BookClient bookClient;
    private final UserClient userClient;
    private final MailService mailService;
    // NEW
    private final VNPayRefundService vnpayRefundService;

    @Transactional
    public Order updateStatus(String orderId, UpdateStatusRequest req) {
        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        OrderStatus next = OrderStatus.valueOf(req.getStatus().toUpperCase());
        OrderStatus prev = o.getStatus();

        if (next == OrderStatus.CANCELLED && prev == OrderStatus.COMPLETED)
            throw new IllegalStateException("Không thể hủy đơn đã hoàn thành.");

        o.setStatus(next);
        if (next == OrderStatus.CANCELLED) {
            o.setCancelReason(req.getCancelReason());

            // trả kho
            for (OrderItem it : o.getItems()) {
                bookClient.decreaseStock(it.getBookId(), it.getQuantity()*-1);
            }

            // tự động hoàn tiền nếu ONLINE và đã thanh toán
            if (Boolean.TRUE.equals(o.getPaymentStatus()) && o.getPaymentMethod() == PaymentMethod.ONLINE) {
                boolean ok = vnpayRefundService.refundFull(o, "Cancel order " + o.getId());
                System.out.println("[VNPay][REFUND][AUTO] order=" + o.getId() + " result=" + ok);
                // tuỳ chính sách: muốn set paymentStatus=false sau khi hoàn xong thì:
//                if (ok) {
//                    o.setPaymentStatus(false);
//                }
            }

            // gửi email hủy
            var user = userClient.getContact(o.getBuyerId());
            mailService.sendOrderCancelled(user.getEmail(), user.getFullName(), o.getId(), req.getCancelReason());
        }

        if (next == OrderStatus.PENDING) {
            for (OrderItem it : o.getItems()) {
                bookClient.decreaseStock(it.getBookId(), it.getQuantity());
            }
        } else if (next == OrderStatus.COMPLETED) {
            for (OrderItem it : o.getItems()) {
                bookClient.increaseSale(it.getBookId(), it.getQuantity());
            }
            o.setPaymentStatus(true);
        }

        o.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(o);
    }
}
