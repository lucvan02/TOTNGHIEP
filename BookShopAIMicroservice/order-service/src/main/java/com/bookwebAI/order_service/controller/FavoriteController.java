package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.response.FavoriteResponse;
import com.bookwebAI.order_service.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService service;

    @GetMapping("/{buyerId}")
    public ApiResponse<List<FavoriteResponse>> list(@PathVariable String buyerId) {
        return new ApiResponse<>("OK", service.list(buyerId));
    }

    @PostMapping("/{buyerId}/{bookId}")
    public ApiResponse<FavoriteResponse> add(@PathVariable String buyerId, @PathVariable Long bookId) {
        return new ApiResponse<>("Đã thêm yêu thích", service.add(buyerId, bookId));
    }

    @DeleteMapping("/{buyerId}/{bookId}")
    public ApiResponse<String> remove(@PathVariable String buyerId, @PathVariable Long bookId) {
        service.remove(buyerId, bookId);
        return new ApiResponse<>("Đã xóa khỏi yêu thích", "OK");
    }

    @GetMapping("/{buyerId}/exists/{bookId}")
    public ApiResponse<Boolean> exists(@PathVariable String buyerId, @PathVariable Long bookId) {
        return new ApiResponse<>("OK", service.exists(buyerId, bookId));
    }
}
