//package com.bookwebAI.order_service.service;
//
//import com.bookwebAI.order_service.client.BookClient;
//import com.bookwebAI.order_service.client.dto.ApiResponse;
//import com.bookwebAI.order_service.client.dto.BookDto;
//import com.bookwebAI.order_service.entity.Order;
//import com.bookwebAI.order_service.entity.OrderItem;
//import com.bookwebAI.order_service.entity.enums.OrderStatus;
//import com.bookwebAI.order_service.entity.enums.PaymentMethod;
//import com.bookwebAI.order_service.repository.OrderItemRepository;
//import com.bookwebAI.order_service.repository.OrderRepository;
//import com.bookwebAI.order_service.dto.request.CheckoutRequest;
//import com.bookwebAI.order_service.util.CodeGenerator;
//import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//
//@Service @RequiredArgsConstructor
//public class CheckoutService {
//    private final OrderRepository orderRepo;
//    private final OrderItemRepository itemRepo;
//    private final BookClient bookClient;
//
//    @Transactional
//    public Order checkout(String buyerId, CheckoutRequest req) {
//        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
//                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
//        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart rỗng");
//
//        int itemsTotal = 0;
//        for (OrderItem it : cart.getItems()) {
//            ApiResponse<BookDto> res = bookClient.getBook(it.getBookId());
//            BookDto b = res.getData();
//            if (b == null) throw new IllegalStateException("Không tìm thấy sách " + it.getBookId());
//            if (b.getStock() == null || b.getStock() < it.getQuantity())
//                throw new IllegalStateException("Hết hàng: " + (b.getTitle()!=null?b.getTitle():it.getBookId()));
//            it.setPrice(b.getPrice());
//            it.setTotal(b.getPrice() * it.getQuantity());
//            itemsTotal += it.getTotal();
//            itemRepo.save(it);
//        }
//
//        cart.setReceiveName(req.getReceiveName());
//        cart.setReceivePhone(req.getReceivePhone());
//        cart.setReceiveAddress(req.getReceiveAddress());
//        cart.setNote(req.getNote());
//        cart.setShippingFee(req.getShippingFee());
//        cart.setTotal(itemsTotal + (req.getShippingFee() == null ? 0 : req.getShippingFee()));
//
//        // payment method + status
//        cart.setPaymentMethod(
//                req.getPaymentMethod() == null ? null : PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase())
//        );
//        // ONLINE: chưa thanh toán => false; COD: cũng false (chờ thu tiền)
//        cart.setPaymentStatus(Boolean.FALSE);
//
//        // đổi trạng thái
//        cart.setStatus(OrderStatus.PENDING);
//        cart.setUpdatedAt(LocalDateTime.now());
//        cart = orderRepo.save(cart);
//
//        // kho GIẢM
//        for (OrderItem it : cart.getItems()) {
//            bookClient.decreaseStock(it.getBookId(), it.getQuantity());
//        }
//
//
//        return cart; // trả về với id (UUID) đang là mã đơn
//    }
//
//    // Đánh dấu đã thanh toán (dùng khi ONLINE success hoặc thu COD xong)
//    @Transactional
//    public Order markPaid(String orderId) {
//        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
//        o.setPaymentStatus(Boolean.TRUE);
//        o.setUpdatedAt(LocalDateTime.now());
//        return orderRepo.save(o);
//    }
//}





package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.enums.PaymentMethod;
import com.bookwebAI.order_service.repository.OrderItemRepository;
import com.bookwebAI.order_service.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final BookClient bookClient;

    private BookDto fetchLiveBook(Long bookId) {
        ApiResponse<BookDto> res = bookClient.getBook(bookId);
        BookDto b = res.getData();
        if (b == null) throw new IllegalStateException("Không tìm thấy sách id=" + bookId);
        return b;
    }

    private PaymentMethod safeParsePayment(String s) {
        if (s == null || s.isBlank()) return null; // để null nếu FE không chọn (COD/ONLINE)
        String v = s.trim().toUpperCase(Locale.ROOT);
        try {
            return PaymentMethod.valueOf(v);
        } catch (IllegalArgumentException ex) {
            // fallback: chấp nhận "COD" hoặc "ONLINE" thôi
            if ("COD".equals(v)) return PaymentMethod.COD;
            if ("ONLINE".equals(v)) return PaymentMethod.ONLINE;
            // hoặc ném lỗi rõ ràng
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ: " + s);
        }
    }

    @Transactional
    public Order checkout(String buyerId, CheckoutRequest req) {
        // 1) Tìm cart
        Order cart = orderRepo.findByBuyerIdAndStatus(buyerId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("Cart rỗng"));
        if (cart.getItems() == null || cart.getItems().isEmpty())
            throw new RuntimeException("Cart rỗng");

        // 2) Re-validate từng item theo dữ liệu live + SNAPSHOT title/image/price
        int itemsTotal = 0;
        for (OrderItem it : cart.getItems()) {
            BookDto b = fetchLiveBook(it.getBookId());

            // validate tồn kho theo số lượng trong giỏ
            Integer stock = b.getStock();
            if (stock == null || stock < it.getQuantity()) {
                throw new IllegalStateException("Hết hàng: " + (b.getTitle() != null ? b.getTitle() : it.getBookId()));
            }

            // SNAPSHOT tại thời điểm chốt đơn
            it.setBookTitle(b.getTitle());
            it.setBookImage(b.getImage());
            it.setPrice(b.getPrice());
            it.setTotal(b.getPrice() * it.getQuantity());
            itemRepo.save(it);

            itemsTotal += it.getTotal();
        }

        // 3) Ghi thông tin nhận hàng + tổng tiền
        int ship = req.getShippingFee() == null ? 0 : req.getShippingFee();
        cart.setReceiveName(req.getReceiveName());
        cart.setReceivePhone(req.getReceivePhone());
        cart.setReceiveAddress(req.getReceiveAddress());
        cart.setNote(req.getNote());
        cart.setShippingFee(ship);
        cart.setTotal(itemsTotal + ship);

        // 4) Phương thức & trạng thái thanh toán
        cart.setPaymentMethod(safeParsePayment(req.getPaymentMethod()));
        cart.setPaymentStatus(Boolean.FALSE); // COD & ONLINE đều để false đến khi thu/đối soát xong

        // 5) Đổi trạng thái CART -> PENDING (đơn đã chốt)
        cart.setStatus(OrderStatus.PENDING);
        cart.setUpdatedAt(LocalDateTime.now());
        cart = orderRepo.save(cart);

        // 6) ❌ KHÔNG TRỪ KHO Ở ĐÂY (để khi Admin chuyển SHIPPED mới trừ kho)
        // Nếu bạn muốn trừ kho ngay khi checkout, mở comment dưới:
         for (OrderItem it : cart.getItems()) {
             bookClient.decreaseStock(it.getBookId(), it.getQuantity());
         }

        return cart; // trả về đơn với id (UUID) đã là mã đơn
    }

    @Transactional
    public Order markPaid(String orderId) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        o.setPaymentStatus(Boolean.TRUE);
        o.setUpdatedAt(LocalDateTime.now());
        return orderRepo.save(o);
    }
}
