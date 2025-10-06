//package com.bookwebAI.order_service.controller;
//
//import com.bookwebai.order.domain.entity.Review;
//import com.bookwebai.order.dto.request.CreateReviewRequest;
//import com.bookwebai.order.service.ReviewService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//
//@RestController
//@RequestMapping("/api/reviews")
//@RequiredArgsConstructor
//public class ReviewController {
//    private final ReviewService reviewService;
//
//
//    @PostMapping("/{buyerId}")
//    public Review create(@PathVariable String buyerId, @RequestBody @Valid CreateReviewRequest req) {
//        return reviewService.create(buyerId, req);
//    }
//}