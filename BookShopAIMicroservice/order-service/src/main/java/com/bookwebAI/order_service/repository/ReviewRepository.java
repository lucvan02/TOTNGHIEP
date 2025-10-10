package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.Review;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);
    boolean existsByOrderItem_Id(Long orderItemId);

    @Query("select coalesce(avg(r.stars),0) from Review r where r.bookId = :bookId")
    Double avgStars(@Param("bookId") Long bookId);

    long countByBookId(Long bookId);
}
