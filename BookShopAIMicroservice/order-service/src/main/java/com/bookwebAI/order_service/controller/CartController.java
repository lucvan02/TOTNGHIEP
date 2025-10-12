package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.request.UpdateCartItemRequest;
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
    public ApiResponse<Order> add(@PathVariable String buyerId, @RequestBody @Valid AddToCartRequest req) {
        return new ApiResponse<>("Đã thêm vào giỏ", cartAppService.addToCart(buyerId, req));
    }

    @GetMapping("/{buyerId}")
    public ApiResponse<Order> get(@PathVariable String buyerId) {
        return new ApiResponse<>("Lấy giỏ hàng", cartAppService.getCart(buyerId));
    }

    @PatchMapping("/{buyerId}/items")
    public ApiResponse<Order> updateQty(@PathVariable String buyerId, @RequestBody @Valid UpdateCartItemRequest req) {
        return new ApiResponse<>("Cập nhật số lượng", cartAppService.updateItemQuantity(buyerId, req));
    }

    @DeleteMapping("/{buyerId}/items/{bookId}")
    public ApiResponse<String> remove(@PathVariable String buyerId, @PathVariable Long bookId) {
        cartAppService.removeItem(buyerId, bookId);
        return new ApiResponse<>("Đã xoá item", "OK");
    }
}
