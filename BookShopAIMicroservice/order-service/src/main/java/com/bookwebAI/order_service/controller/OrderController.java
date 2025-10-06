package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final CheckoutService checkoutService;


    @PostMapping("/{buyerId}/checkout")
    public Order checkout(@PathVariable String buyerId, @RequestBody @Valid CheckoutRequest req) {
        return checkoutService.checkout(buyerId, req);
    }
}