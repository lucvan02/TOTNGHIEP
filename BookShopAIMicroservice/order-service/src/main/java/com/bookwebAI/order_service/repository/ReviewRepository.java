package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderItem_Id(Long orderItemId);
}