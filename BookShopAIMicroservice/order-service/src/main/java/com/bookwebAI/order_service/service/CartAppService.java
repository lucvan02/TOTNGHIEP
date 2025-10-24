package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.dto.request.AddToCartRequest;
import com.bookwebAI.order_service.dto.request.UpdateCartItemRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartAppService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;

    /**
     * Helper: tính lại tổng của giỏ dựa trên item.total (đã làm tươi trước đó)
     */
    private void recomputeCartTotal(Order cart) {
        int itemsTotal = cart.getItems().stream()
                .map(i -> i.getTotal() == null ? 0 : i.getTotal())
                .reduce(0, Integer::sum);
        cart.setTotal(itemsTotal);
        cart.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Helper: gọi book-service lấy sách, ném lỗi gọn gàng
     */
    private BookDto fetchLiveBook(Long bookId) {
        ApiResponse<BookDto> res = bookClient.getBook(bookId);
        BookDto b = res.getData();
        if (b == null) {
            throw new RuntimeException("Không tìm thấy sách");
        }
        return b;
    }

    /**
     * Helper: validate tồn kho hiện tại
     */
    private void ensureStock(BookDto b, int requiredQty) {
        Integer stock = b.getStock(); // có thể null từ book-service cũ
        if (stock == null || stock < requiredQty) {
            throw new IllegalArgumentException("Số lượng vượt tồn kho");
        }
    }

    /**
     * Helper: làm tươi giá & tổng một item theo dữ liệu hiện tại của sách
     */
    private void refreshItemPricing(OrderItem it, BookDto b) {
        // dùng giá hiện tại (live)
        it.setPrice(b.getPrice());
        it.setTotal(b.getPrice() * it.getQuantity());

        // cập nhật info hiển thị (live) cho FE
        it.setBookTitle(b.getTitle());
        it.setBookImage(b.getImage());
    }

    @Transactional
    public Order addToCart(String buyerId, AddToCartRequest req) {
        // 1) Lấy/khởi tạo CART
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseGet(() -> orderRepo.save(Order.builder()
                        .buyerId(buyerId)
                        .status(OrderStatus.CART)
                        .paymentStatus(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .total(0)
                        .build()));

        // 2) Lấy live book + validate stock theo (qty cũ + qty mới)
        BookDto b = fetchLiveBook(req.getBookId());

        Optional<OrderItem> existed = cart.getItems().stream()
                .filter(i -> i.getBookId().equals(req.getBookId()))
                .findFirst();

        if (existed.isPresent()) {
            OrderItem it = existed.get();
            int newQty = it.getQuantity() + req.getQuantity();
            ensureStock(b, newQty);

            it.setQuantity(newQty);
            refreshItemPricing(it, b);
            itemRepo.save(it);
        } else {
            ensureStock(b, req.getQuantity());
            OrderItem newItem = OrderItem.builder()
                    .order(cart)
                    .bookId(b.getId())
                    .quantity(req.getQuantity())
                    // các trường hiển thị/giá lấy live
                    .bookTitle(b.getTitle())
                    .bookImage(b.getImage())
                    .price(b.getPrice())
                    .total(b.getPrice() * req.getQuantity())
                    .hasReview(false)
                    .build();
            cart.getItems().add(newItem);
        }

        // 3) Tính lại tổng giỏ
        recomputeCartTotal(cart);
        return orderRepo.save(cart);
    }

    /**
     * GET giỏ hàng: làm tươi từng item theo giá hiện tại trước khi trả ra
     * (để CART luôn phản ánh dữ liệu mới nhất)
     */
    @Transactional
    public Order getCart(String buyerId) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART).orElse(null);
        if (cart == null) return null;

        // Làm tươi từng item theo dữ liệu live
        for (OrderItem it : cart.getItems()) {
            BookDto b = fetchLiveBook(it.getBookId());
            // Quantity giữ nguyên; chỉ validate nhẹ stock để cảnh báo sớm (không ném lỗi để người dùng còn sửa)
            // Bạn có thể lựa chọn: nếu hết hàng thì set total=0 và thêm flag ra DTO.
            Integer stock = b.getStock();
            if (stock != null && stock < it.getQuantity()) {
                // vẫn cập nhật giá/tên/ảnh nhưng total giữ theo số lượng hiện có?
                // Ở đây mình vẫn giữ nguyên quantity, FE có thể chặn ở bước checkout.
            }
            refreshItemPricing(it, b);
        }

        // Tính lại tổng giỏ theo giá live
        recomputeCartTotal(cart);
        return orderRepo.save(cart);
    }

    @Transactional
    public Order updateItemQuantity(String buyerId, UpdateCartItemRequest req) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (req.getQuantity() != null && req.getQuantity() == 0) {
            // Xóa item
            cart.getItems().removeIf(i -> i.getBookId().equals(req.getBookId()));
        } else {
            // Làm tươi từ book-service và validate tồn kho với số lượng mới
            BookDto b = fetchLiveBook(req.getBookId());
            ensureStock(b, req.getQuantity());

            OrderItem it = cart.getItems().stream()
                    .filter(i -> i.getBookId().equals(req.getBookId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Item không tồn tại trong giỏ"));

            it.setQuantity(req.getQuantity());
            refreshItemPricing(it, b);
            itemRepo.save(it);
        }

        recomputeCartTotal(cart);
        return orderRepo.save(cart);
    }

    @Transactional
    public void removeItem(String buyerId, Long bookId) {
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(i -> i.getBookId().equals(bookId));
        recomputeCartTotal(cart);
        orderRepo.save(cart);
    }
}
