package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.OrderRepository;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.util.CodeGenerator;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class CheckoutService {
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;


    @Transactional
    @CircuitBreaker(name = "bookClient")
    public Order checkout(String buyerId, CheckoutRequest req) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart rỗng");


// 1) Re-validate tồn & snapshot lại price
        for (OrderItem it : cart.getItems()) {
            ApiResponse<BookDto> res = bookClient.getBook(it.getBookId());
            BookDto b = res.getData();
            if (b == null) throw new IllegalStateException("Không tìm thấy sách " + it.getBookId());
            if (b.getStock() == null || b.getStock() < it.getQuantity()) {
                throw new IllegalStateException("Hết hàng: " + (b.getTitle() != null ? b.getTitle() : it.getBookId()));
            }
            it.setPrice(b.getPrice());
            it.setTotal(b.getPrice() * it.getQuantity());
            itemRepo.save(it);

        }


// 2) Điền thông tin nhận hàng & đổi trạng thái
        cart.setShippingFee(req.getShippingFee());
        cart.setReceiveName(req.getReceiveName());
        cart.setReceivePhone(req.getReceivePhone());
        cart.setReceiveAddress(req.getReceiveAddress());
        cart.setNote(req.getNote());


        cart.setStatus(OrderStatus.PENDING);
        cart.setCode(CodeGenerator.gen("OD"));
        cart.setUpdatedAt(LocalDateTime.now());
        cart = orderRepo.save(cart);


// 3) Giảm tồn & tăng sale (best-effort)
        for (OrderItem it : cart.getItems()) {
            bookClient.decreaseStock(it.getBookId(), it.getQuantity());
            bookClient.increaseSale(it.getBookId(), it.getQuantity());
        }


// 4) Demo COD: mark PAID luôn
        if ("COD".equalsIgnoreCase(req.getPaymentMethod())) {
            cart.setStatus(OrderStatus.PAID);
            cart.setUpdatedAt(LocalDateTime.now());
            cart = orderRepo.save(cart);
        }


        return cart;
    }
}