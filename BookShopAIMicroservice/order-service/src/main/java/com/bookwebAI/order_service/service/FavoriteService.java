//package com.bookwebAI.order_service.service;
//
//import com.bookwebAI.order_service.client.BookClient;
//import com.bookwebAI.order_service.client.dto.BookLiteDto;
//import com.bookwebAI.order_service.client.dto.ApiResponse;
//import com.bookwebAI.order_service.entity.Favorite;
//import com.bookwebAI.order_service.repository.FavoriteRepository;
//import com.bookwebAI.order_service.dto.response.FavoriteResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service @RequiredArgsConstructor
//public class FavoriteService {
//    private final FavoriteRepository repo;
//    private final BookClient bookClient;
//
//    @Transactional(readOnly = true)
//    public List<FavoriteResponse> list(String buyerId) {
//        return repo.findByBuyerIdOrderByCreatedAtDesc(buyerId)
//                .stream().map(this::toRes).toList();
//    }
//
//    @Transactional
//    public FavoriteResponse add(String buyerId, Long bookId) {
//        if (repo.existsByBuyerIdAndBookId(buyerId, bookId))
//            throw new IllegalStateException("Đã nằm trong yêu thích");
//
//        // lấy snapshot sách
//        ApiResponse<BookLiteDto> res = bookClient.getById(bookId);
//        BookLiteDto b = res.getData();
//        if (b == null) throw new IllegalArgumentException("Sách không tồn tại");
//
//        Favorite fv = Favorite.builder()
//                .buyerId(buyerId)
//                .bookId(bookId)
//                .bookTitle(b.getTitle())
//                .bookImage(b.getImage())
//                .price(b.getPrice())
//                .createdAt(LocalDateTime.now())
//                .build();
//        repo.save(fv);
//        return toRes(fv);
//    }
//
//    @Transactional
//    public void remove(String buyerId, Long bookId) {
//        Favorite fav = repo.findByBuyerIdAndBookId(buyerId, bookId)
//                .orElseThrow(() -> new IllegalArgumentException("Mục yêu thích không tồn tại"));
//        repo.delete(fav); // <-- xóa entity trực tiếp, không có chuyện ép kiểu nữa
//    }
//
//
//    @Transactional(readOnly = true)
//    public boolean exists(String buyerId, Long bookId) {
//        return repo.existsByBuyerIdAndBookId(buyerId, bookId);
//    }
//
//    private FavoriteResponse toRes(Favorite f) {
//        return FavoriteResponse.builder()
//                .id(f.getId())
//                .bookId(f.getBookId())
//                .bookTitle(f.getBookTitle())
//                .bookImage(f.getBookImage())
//                .price(f.getPrice())
//                .createdAt(f.getCreatedAt())
//                .build();
//    }
//}



// service/FavoriteService.java
package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.client.dto.BookLiteDto;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.entity.Favorite;
import com.bookwebAI.order_service.repository.FavoriteRepository;
import com.bookwebAI.order_service.dto.response.FavoriteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository repo;
    private final BookClient bookClient;

    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(String buyerId) {
        var favs = repo.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        if (favs.isEmpty()) return List.of();

        var ids = favs.stream().map(Favorite::getBookId).distinct().toList();
        Map<Long, BookDto> live = Collections.emptyMap();
        try {
            ApiResponse<List<BookDto>> resp = bookClient.bulk(ids);
            List<BookDto> data = Optional.ofNullable(resp.getData()).orElseGet(List::of);
            live = data.stream().collect(Collectors.toMap(BookDto::getId, b -> b));
        } catch (Exception ignore) {}

        Map<Long, BookDto> liveMap = live;

        return favs.stream().map(f -> {
            BookDto b = liveMap.get(f.getBookId());
            boolean ok = (b != null);
            return FavoriteResponse.builder()
                    .id(f.getId())
                    .bookId(f.getBookId())
                    .title(ok ? b.getTitle() : f.getBookTitle())
                    .image(ok ? b.getImage() : f.getBookImage())
                    .price(ok ? b.getPrice() : f.getPrice())
                    .stock(ok ? b.getStock() : null)
                    .status(ok ? b.getStatus() : null)
                    .star(ok ? b.getStar() : null)
                    .live(ok)
                    .snapshotTitle(f.getBookTitle())
                    .snapshotImage(f.getBookImage())
                    .snapshotPrice(f.getPrice())
                    .createdAt(f.getCreatedAt())
                    .build();
        }).toList();
    }

    @Transactional
    public FavoriteResponse add(String buyerId, Long bookId) {
        if (repo.existsByBuyerIdAndBookId(buyerId, bookId))
            throw new IllegalStateException("Đã nằm trong yêu thích");

        // lấy snapshot từ BookDto
        String title = "Sách";
        String image = null;
        Long price = 0L;
        try {
            ApiResponse<BookDto> res = bookClient.getBook(bookId);
            BookDto b = res.getData();
            if (b != null) {
                title = b.getTitle();
                image = b.getImage();
                price = Long.valueOf(b.getPrice());
            }
        } catch (Exception ignore) {}

        Favorite fv = Favorite.builder()
                .buyerId(buyerId)
                .bookId(bookId)
                .bookTitle(title)
                .bookImage(image)
                .price(price)
                .createdAt(LocalDateTime.now())
                .build();
        repo.save(fv);

        // trả về merge-on-read luôn
        return list(buyerId).stream()
                .filter(x -> x.getBookId().equals(bookId))
                .findFirst()
                .orElse(FavoriteResponse.builder()
                        .id(fv.getId()).bookId(bookId)
                        .title(title).image(image).price(price)
                        .live(false).createdAt(fv.getCreatedAt()).build());
    }

    @Transactional
    public void remove(String buyerId, Long bookId) {
        var fav = repo.findByBuyerIdAndBookId(buyerId, bookId)
                .orElseThrow(() -> new IllegalArgumentException("Mục yêu thích không tồn tại"));
        repo.delete(fav);
    }

    @Transactional(readOnly = true)
    public boolean exists(String buyerId, Long bookId) {
        return repo.existsByBuyerIdAndBookId(buyerId, bookId);
    }
}
