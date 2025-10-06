package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.dto.request.AddToCartRequest;
import com.bookwebAI.order_service.service.CartAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartAppService cartAppService;


    @PostMapping("/{buyerId}/items")
    public Order add(@PathVariable String buyerId, @RequestBody @Valid AddToCartRequest req) {
        return cartAppService.addToCart(buyerId, req);
    }


    @GetMapping("/{buyerId}")
    public Order get(@PathVariable String buyerId) {
        return cartAppService.getCart(buyerId);
    }


    @DeleteMapping("/{buyerId}/items/{bookId}")
    public void remove(@PathVariable String buyerId, @PathVariable Long bookId) {
        cartAppService.removeItem(buyerId, bookId);
    }
}