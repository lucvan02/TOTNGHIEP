package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.enums.PaymentMethod;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.OrderRepository;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.util.CodeGenerator;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.UUID;


//@Service
//@RequiredArgsConstructor
//public class CheckoutService {
//    private final OrderRepository orderRepo;
//    private final OrderItemRepository itemRepo;
//    private final BookClient bookClient;
//
//
//    @Transactional
//    @CircuitBreaker(name = "bookClient")
//    public Order checkout(String buyerId, CheckoutRequest req) {
//        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
//                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
//        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart rỗng");
//
//
//// 1) Re-validate tồn & snapshot lại price
//        for (OrderItem it : cart.getItems()) {
//            ApiResponse<BookDto> res = bookClient.getBook(it.getBookId());
//            BookDto b = res.getData();
//            if (b == null) throw new IllegalStateException("Không tìm thấy sách " + it.getBookId());
//            if (b.getStock() == null || b.getStock() < it.getQuantity()) {
//                throw new IllegalStateException("Hết hàng: " + (b.getTitle() != null ? b.getTitle() : it.getBookId()));
//            }
//            it.setPrice(b.getPrice());
//            it.setTotal(b.getPrice() * it.getQuantity());
//            itemRepo.save(it);
//
//        }
//
//
//// 2) Điền thông tin nhận hàng & đổi trạng thái
//        cart.setShippingFee(req.getShippingFee());
//        cart.setReceiveName(req.getReceiveName());
//        cart.setReceivePhone(req.getReceivePhone());
//        cart.setReceiveAddress(req.getReceiveAddress());
//        cart.setNote(req.getNote());
//
//
//        cart.setStatus(OrderStatus.PENDING);
//        cart.setCode(CodeGenerator.gen("OD"));
//        cart.setUpdatedAt(LocalDateTime.now());
//        cart = orderRepo.save(cart);
//
//
//// 3) Giảm tồn & tăng sale (best-effort)
//        for (OrderItem it : cart.getItems()) {
//            bookClient.decreaseStock(it.getBookId(), it.getQuantity());
//            bookClient.increaseSale(it.getBookId(), it.getQuantity());
//        }
//
//
//// 4) Demo COD: mark PAID luôn
//        if ("COD".equalsIgnoreCase(req.getPaymentMethod())) {
//            cart.setStatus(OrderStatus.PAID);
//            cart.setUpdatedAt(LocalDateTime.now());
//            cart = orderRepo.save(cart);
//        }
//
//
//        return cart;
//    }
//}



//
//@Service @RequiredArgsConstructor
//public class CheckoutService {
//    private final OrderRepository orderRepo;
//    private final OrderItemRepository itemRepo;
//    private final BookClient bookClient;
//
//    @Transactional
//    public Order checkout(String buyerId, CheckoutRequest req) {
//        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
//                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
//        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart rỗng");
//
//        // 1) re-validate
//        int itemsTotal = 0;
//        for (OrderItem it : cart.getItems()) {
//            ApiResponse<BookDto> res = bookClient.getBook(it.getBookId());
//            BookDto b = res.getData();
//            if (b == null) throw new IllegalStateException("Không tìm thấy sách " + it.getBookId());
//            if (b.getStock() == null || b.getStock() < it.getQuantity())
//                throw new IllegalStateException("Hết hàng: " + (b.getTitle()!=null?b.getTitle():it.getBookId()));
//            it.setPrice(b.getPrice());
//            it.setTotal(b.getPrice() * it.getQuantity());
//            itemsTotal += it.getTotal();
//            itemRepo.save(it);
//        }
//
//        // 2) điền info + chuyển trạng thái
//        cart.setReceiveName(req.getReceiveName());
//        cart.setReceivePhone(req.getReceivePhone());
//        cart.setReceiveAddress(req.getReceiveAddress());
//        cart.setNote(req.getNote());
//        cart.setShippingFee(req.getShippingFee());
//        cart.setTotal(itemsTotal + (req.getShippingFee() == null ? 0 : req.getShippingFee()));
//        cart.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase()));
//
//        cart.setStatus(OrderStatus.PENDING);
//        cart.setCode(UUID.randomUUID().toString());  // mã đơn = UUID
//        cart.setUpdatedAt(LocalDateTime.now());
//        cart = orderRepo.save(cart);
//
//        // 3) giảm kho, tăng sale
//        for (OrderItem it : cart.getItems()) {
//            bookClient.decreaseStock(it.getBookId(), it.getQuantity());
//            bookClient.increaseSale(it.getBookId(), it.getQuantity());
//        }
//
//        // 4) nếu ONLINE thì chờ thanh toán → giữ PENDING,
//        //    nếu COD: vẫn PENDING (chờ admin CONFIRMED/PAID), không auto-PAID nữa.
//        return cart;
//    }
//
//    // callback/giả lập online success
//    @Transactional
//    public Order markPaid(String code) {
//        Order o = orderRepo.findByCode(code).orElseThrow(() -> new RuntimeException("Order not found"));
//        o.setStatus(OrderStatus.PAID);
//        o.setUpdatedAt(LocalDateTime.now());
//        return orderRepo.save(o);
//    }
//}








@Service @RequiredArgsConstructor
public class CheckoutService {
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;

    @Transactional
    public Order checkout(String buyerId, CheckoutRequest req) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart rỗng");

        int itemsTotal = 0;
        for (OrderItem it : cart.getItems()) {
            ApiResponse<BookDto> res = bookClient.getBook(it.getBookId());
            BookDto b = res.getData();
            if (b == null) throw new IllegalStateException("Không tìm thấy sách " + it.getBookId());
            if (b.getStock() == null || b.getStock() < it.getQuantity())
                throw new IllegalStateException("Hết hàng: " + (b.getTitle()!=null?b.getTitle():it.getBookId()));
            it.setPrice(b.getPrice());
            it.setTotal(b.getPrice() * it.getQuantity());
            itemsTotal += it.getTotal();
            itemRepo.save(it);
        }

        cart.setReceiveName(req.getReceiveName());
        cart.setReceivePhone(req.getReceivePhone());
        cart.setReceiveAddress(req.getReceiveAddress());
        cart.setNote(req.getNote());
        cart.setShippingFee(req.getShippingFee());
        cart.setTotal(itemsTotal + (req.getShippingFee() == null ? 0 : req.getShippingFee()));

        // payment method + status
        cart.setPaymentMethod(
                req.getPaymentMethod() == null ? null : PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase())
        );
        // ONLINE: chưa thanh toán => false; COD: cũng false (chờ thu tiền)
        cart.setPaymentStatus(Boolean.FALSE);

        // đổi trạng thái
        cart.setStatus(OrderStatus.PENDING);
        cart.setUpdatedAt(LocalDateTime.now());
        cart = orderRepo.save(cart);

//        // kho + sale
//        for (OrderItem it : cart.getItems()) {
//            bookClient.decreaseStock(it.getBookId(), it.getQuantity());
//            bookClient.increaseSale(it.getBookId(), it.getQuantity());
//        }

        return cart; // trả về với id (UUID) đang là mã đơn
    }

    // Đánh dấu đã thanh toán (dùng khi ONLINE success hoặc thu COD xong)
    @Transactional
    public Order markPaid(String orderId) {
        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        o.setPaymentStatus(Boolean.TRUE);
        o.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(o);
    }
}
