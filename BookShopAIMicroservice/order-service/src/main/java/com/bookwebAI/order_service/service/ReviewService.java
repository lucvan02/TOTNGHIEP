package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.dto.request.CreateReviewRequest;
import com.bookwebAI.order_service.entity.Review;
import com.bookwebAI.order_service.repository.ReviewRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public Review create(String buyerId, CreateReviewRequest req) {
        Review review = new Review();
        review.setComment(req.getComment());
        review.setStar(req.getStar());
        review.setCreatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }
}
