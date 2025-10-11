package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    boolean existsByBuyerIdAndBookId(String buyerId, Long bookId);
    Optional<Favorite> findByBuyerIdAndBookId(String buyerId, Long bookId);

}
