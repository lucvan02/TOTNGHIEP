package com.bookwebAI.order_service.service;



import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.UserClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.RatingUpdateDto;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.Review;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.ReviewRepository;
import com.bookwebAI.order_service.dto.request.CreateReviewRequest;
import com.bookwebAI.order_service.dto.response.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;
    private final UserClient userClient;

    @Transactional
    public ReviewResponse create(String buyerId, CreateReviewRequest req) {
        OrderItem item = itemRepo.findById(req.getOrderItemId())
                .orElseThrow(() -> new IllegalArgumentException("Order item không tồn tại"));

        // quyền: buyer phải là chủ đơn, đơn phải COMPLETED, và chưa review
        if (!item.getOrder().getBuyerId().equals(buyerId))
            throw new IllegalStateException("Bạn không có quyền đánh giá item này");
        if (item.getOrder().getStatus() != OrderStatus.COMPLETED)
            throw new IllegalStateException("Chỉ đánh giá đơn đã hoàn thành");
        if (Boolean.TRUE.equals(item.getHasReview()) || reviewRepo.existsByOrderItem_Id(item.getId()))
            throw new IllegalStateException("Item đã được đánh giá");

        // 👇 lấy thông tin người mua từ user-service
        var contact = userClient.getContact(buyerId);
        var displayName = contact != null && contact.getFullName() != null ? contact.getFullName() : "Người dùng";
        var avatar = contact != null ? contact.getAvatar() : null;

        Review rv = Review.builder()
                .orderItem(item)
                .buyerId(buyerId)
                .bookId(item.getBookId())
                .buyerName(displayName)      // 👈 lưu snapshot
                .buyerAvatar(avatar)
                .stars(req.getStars())
                .comment(req.getComment())
                .createdAt(LocalDateTime.now())
                .build();
        reviewRepo.save(rv);

        item.setHasReview(true);
        itemRepo.save(item);

        // ⬇️ Cập nhật rating trung bình cho book
        Double avg = reviewRepo.avgStars(item.getBookId());
        long cnt = reviewRepo.countByBookId(item.getBookId());
        bookClient.updateRating(item.getBookId(), new RatingUpdateDto(avg, cnt));

        return toRes(rv);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> byBuyer(String buyerId) {
        return reviewRepo.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream().map(this::toRes).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> byBook(Long bookId) {
        return reviewRepo.findByBookIdOrderByCreatedAtDesc(bookId).stream().map(this::toRes).toList();
    }

    private ReviewResponse toRes(Review rv) {
        return ReviewResponse.builder()
                .id(rv.getId())
                .orderItemId(rv.getOrderItem().getId())
                .bookId(rv.getBookId())
                .buyerId(rv.getBuyerId())
                .buyerName(rv.getBuyerName())          // 👈
                .buyerAvatar(rv.getBuyerAvatar())      // 👈
                .stars(rv.getStars())
                .comment(rv.getComment())
                .createdAt(rv.getCreatedAt())
                .bookTitle(rv.getOrderItem().getBookTitle())
                .bookImage(rv.getOrderItem().getBookImage())
                .build();
    }
}
