package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.dto.request.CreateReviewRequest;
import com.bookwebAI.order_service.entity.Review;
import com.bookwebAI.order_service.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;


    @PostMapping("/{buyerId}")
    public Review create(@PathVariable String buyerId, @RequestBody @Valid CreateReviewRequest req) {
        return reviewService.create(buyerId, req);
    }
}