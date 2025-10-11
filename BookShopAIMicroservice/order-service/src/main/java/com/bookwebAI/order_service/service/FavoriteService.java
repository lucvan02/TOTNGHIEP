package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.BookLiteDto;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.entity.Favorite;
import com.bookwebAI.order_service.repository.FavoriteRepository;
import com.bookwebAI.order_service.dto.response.FavoriteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository repo;
    private final BookClient bookClient;

    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(String buyerId) {
        return repo.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream().map(this::toRes).toList();
    }

    @Transactional
    public FavoriteResponse add(String buyerId, Long bookId) {
        if (repo.existsByBuyerIdAndBookId(buyerId, bookId))
            throw new IllegalStateException("Đã nằm trong yêu thích");

        // lấy snapshot sách
        ApiResponse<BookLiteDto> res = bookClient.getById(bookId);
        BookLiteDto b = res.getData();
        if (b == null) throw new IllegalArgumentException("Sách không tồn tại");

        Favorite fv = Favorite.builder()
                .buyerId(buyerId)
                .bookId(bookId)
                .bookTitle(b.getTitle())
                .bookImage(b.getImage())
                .price(b.getPrice())
                .createdAt(LocalDateTime.now())
                .build();
        repo.save(fv);
        return toRes(fv);
    }

    @Transactional
    public void remove(String buyerId, Long bookId) {
        Favorite fav = repo.findByBuyerIdAndBookId(buyerId, bookId)
                .orElseThrow(() -> new IllegalArgumentException("Mục yêu thích không tồn tại"));
        repo.delete(fav); // <-- xóa entity trực tiếp, không có chuyện ép kiểu nữa
    }


    @Transactional(readOnly = true)
    public boolean exists(String buyerId, Long bookId) {
        return repo.existsByBuyerIdAndBookId(buyerId, bookId);
    }

    private FavoriteResponse toRes(Favorite f) {
        return FavoriteResponse.builder()
                .id(f.getId())
                .bookId(f.getBookId())
                .bookTitle(f.getBookTitle())
                .bookImage(f.getBookImage())
                .price(f.getPrice())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
