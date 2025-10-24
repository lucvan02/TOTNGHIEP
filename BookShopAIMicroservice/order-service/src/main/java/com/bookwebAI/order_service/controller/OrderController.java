package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.request.UpdateStatusRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.repository.OrderRepository;
import com.bookwebAI.order_service.service.AdminOrderService;
import com.bookwebAI.order_service.service.CheckoutService;
import com.bookwebAI.order_service.service.OrderService;
import com.bookwebAI.order_service.service.VNPayService;
import com.bookwebAI.order_service.util.VNPayUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final CheckoutService checkoutService;
    private final OrderRepository orderRepo;
    private final OrderService adminOrderService;

    private final AdminOrderService adminOrderService1;
    private final VNPayService vnpayService;

    @PostMapping("/{buyerId}/checkout")
    public ApiResponse<Order> checkout(@PathVariable String buyerId, @RequestBody @Valid CheckoutRequest req) {
        return new ApiResponse<>("Đặt hàng thành công", checkoutService.checkout(buyerId, req));
    }

    @GetMapping("/{buyerId}/history")
    public ApiResponse<List<Order>> history(@PathVariable String buyerId) {
        return new ApiResponse<>("Lịch sử đơn hàng", orderRepo.historyOf(buyerId));
    }

    // Callback/giả lập thanh toán ONLINE ok hoặc xác nhận đã thu COD
    @PostMapping("/{orderId}/payment/success")
    public ApiResponse<Order> paymentSuccess(@PathVariable String orderId) {
        return new ApiResponse<>("Đã ghi nhận thanh toán", checkoutService.markPaid(orderId));
    }


    @GetMapping
    public ApiResponse<List<Order>> list(@RequestParam(required = false) String status) {
        return new ApiResponse<>("Danh sách đơn", adminOrderService.listAll(status));
    }

    @GetMapping("/{orderId}")
    public ApiResponse<Order> detail(@PathVariable String orderId) {
        return new ApiResponse<>("Chi tiết đơn", adminOrderService.get(orderId));
    }

//    @PutMapping("/{orderId}/status")
//    public ApiResponse<Order> updateStatus(@PathVariable String orderId, @RequestBody @Valid UpdateStatusRequest req) {
//        return new ApiResponse<>("Cập nhật trạng thái", adminOrderService.updateStatus(orderId, req));
//    }

    @PutMapping("/{orderId}/status")
    public ApiResponse<Order> updateStatus(@PathVariable String orderId, @RequestBody @Valid UpdateStatusRequest req) {
        return new ApiResponse<>("Cập nhật trạng thái", adminOrderService1.updateStatus(orderId, req));
    }

    @PutMapping("/{orderId}/payment")
    public ApiResponse<Order> setPayment(@PathVariable String orderId, @RequestParam boolean paid) {
        return new ApiResponse<>("Cập nhật trạng thái thanh toán", adminOrderService.setPaymentStatus(orderId, paid));
    }

    @PostMapping("/{buyerId}/{orderId}/cancel")
    public ApiResponse<Order> cancelByBuyer(
            @PathVariable String buyerId,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body
    ) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!o.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn này");
        }
        if (o.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ hủy khi đơn đang PENDING");
        }

        // Tái sử dụng service admin để đảm bảo gửi email + lưu lý do
        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus("CANCELLED");
        req.setCancelReason(body.getOrDefault("reason", "Khách yêu cầu hủy"));

        Order updated = adminOrderService.updateStatus(orderId, req);
        return new ApiResponse<>("Đã hủy đơn", updated);
    }





    @PostMapping("/{buyerId}/checkout-online")
    public ApiResponse<Map<String, Object>> checkoutOnline(@PathVariable String buyerId,
                                                           @RequestBody @Valid CheckoutRequest req) {
        Order order = checkoutService.checkout(buyerId, req); // vẫn Pending + tính total
        String paymentUrl = vnpayService.createPaymentUrl(order.getId(), order.getTotal());
        return new ApiResponse<>("Tạo link thanh toán thành công", Map.of("paymentUrl", paymentUrl));
    }



    @GetMapping("/vnpay-return")
    public ResponseEntity<String> vnpayReturn(@RequestParam Map<String, String> allParams) {
        // 1) Lấy bộ tham số vnp_, bỏ SecureHash/Type
        Map<String, String> vnp = new HashMap<>();
        for (var e : allParams.entrySet()) if (e.getKey().startsWith("vnp_")) vnp.put(e.getKey(), e.getValue());
        String vnpSecureHash = vnp.remove("vnp_SecureHash");
        vnp.remove("vnp_SecureHashType");

        // 2) Sort key + build hashData = key=URLEncode(value) nối bằng '&'
        List<String> keys = new ArrayList<>(vnp.keySet());
        Collections.sort(keys);
        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = vnp.get(k);                  // giá trị đã decode bởi Spring
            if (v != null && !v.isEmpty()) {
                String encV = URLEncoder.encode(v, StandardCharsets.US_ASCII); // <— encode lại
                hashData.append(k).append('=').append(encV);
                if (i < keys.size() - 1) hashData.append('&');
            }
        }

        String myHash = VNPayUtil.hmacSHA512(vnpayService.getSecret().trim(), hashData.toString());

        System.out.println("[VNPay][RET] params=" + allParams);
        System.out.println("[VNPay][RET] hashData=" + hashData);
        System.out.println("[VNPay][RET] myHash=" + myHash);
        System.out.println("[VNPay][RET] vnp_SecureHash=" + vnpSecureHash);

        if (!myHash.equalsIgnoreCase(vnpSecureHash)) {
            return ResponseEntity.ok("<h3 style='color:#d32f2f'>❌ Sai chữ ký VNPay</h3>");
        }

        // 3) Đúng chữ ký → xử lý kết quả
        String rsp = vnp.get("vnp_ResponseCode");
        String txn = vnp.get("vnp_TransactionStatus");
        String orderInfo = vnp.get("vnp_OrderInfo");               // "Thanh toan don hang:xxxx"
        String orderId = (orderInfo != null) ? orderInfo.replaceFirst(".*:", "") : null;

        if ("00".equals(rsp) && "00".equals(txn) && orderId != null) {
            checkoutService.markPaid(orderId);
            return ResponseEntity.ok("<h2 style='color:#2e7d32'>✅ Thanh toán thành công!</h2>");
        }
        return ResponseEntity.ok("<h2 style='color:#d32f2f'>❌ Thanh toán thất bại!</h2>");
    }



}
