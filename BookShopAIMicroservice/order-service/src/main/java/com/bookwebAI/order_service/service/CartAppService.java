package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.dto.request.AddToCartRequest;
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
import java.util.Optional;

@Service @RequiredArgsConstructor
public class CartAppService {
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;

    @Transactional
    public Order addToCart(String buyerId, AddToCartRequest req) {
        // 1) Lấy (hoặc tạo) đơn CART
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseGet(() -> orderRepo.save(Order.builder()
                        .buyerId(buyerId)
                        .status(OrderStatus.CART)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));

        // 2) Lấy book (để lấy giá/ảnh/tên & check stock)
        ApiResponse<BookDto> res = bookClient.getBook(req.getBookId());
        BookDto b = res.getData();
        if (b == null) {
            throw new IllegalStateException("Không tìm thấy sách id=" + req.getBookId());
        }
        Integer stock = b.getStock();
        if (stock == null || stock < req.getQuantity()) {
            throw new IllegalArgumentException("Số lượng vượt tồn kho");
        }
        // 3) Merge item
        Optional<OrderItem> existed = cart.getItems().stream()
                .filter(i -> i.getBookId().equals(req.getBookId()))
                .findFirst();

        if (existed.isPresent()) {
            OrderItem it = existed.get();
            it.setQuantity(it.getQuantity() + req.getQuantity());
            it.setPrice(b.getPrice()); // snapshot lại giá mới nhất nếu muốn
            it.setTotal(it.getPrice() * it.getQuantity());
            itemRepo.save(it);
        } else {
            OrderItem it = OrderItem.builder()
                    .order(cart)
                    .bookId(b.getId())
                    .bookTitle(b.getTitle())
                    .bookImage(b.getImage())
                    .price(b.getPrice())
                    .quantity(req.getQuantity())
                    .total(b.getPrice() * req.getQuantity())
                    .hasReview(false)
                    .build();
            cart.getItems().add(it);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(cart);
    }

//    @Transactional(readOnly = true)
    @Transactional
    public Order getCart(String buyerId) {
        return orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART).orElse(null);
    }

    @Transactional
    public void removeItem(String buyerId, Long bookId) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.getItems().removeIf(i -> i.getBookId().equals(bookId));
        cart.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(cart);
    }
}
