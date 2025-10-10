package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.request.CreateReviewRequest;
import com.bookwebAI.order_service.dto.response.ReviewResponse;
import com.bookwebAI.order_service.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    // nếu vẫn dùng buyerId trên path:
    @PostMapping("/{buyerId}")
    public ApiResponse<ReviewResponse> create(@PathVariable String buyerId, @RequestBody @Valid CreateReviewRequest req) {
        return new ApiResponse<>("Đánh giá thành công", service.create(buyerId, req));
    }

    @GetMapping("/{buyerId}")
    public ApiResponse<List<ReviewResponse>> byBuyer(@PathVariable String buyerId) {
        return new ApiResponse<>("Danh sách đánh giá của bạn", service.byBuyer(buyerId));
    }

    // tuỳ nhu cầu FE:
    @GetMapping("/book/{bookId}")
    public ApiResponse<List<ReviewResponse>> byBook(@PathVariable Long bookId) {
        return new ApiResponse<>("Đánh giá theo sách", service.byBook(bookId));
    }
}
