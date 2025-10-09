package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.request.UpdateStatusRequest;
import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.dto.request.CheckoutRequest;
import com.bookwebAI.order_service.repository.OrderRepository;
import com.bookwebAI.order_service.service.CheckoutService;
import com.bookwebAI.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


//@RestController
//@RequestMapping("/api/orders")
//@RequiredArgsConstructor
//public class OrderController {
//    private final CheckoutService checkoutService;
//
//
//    @PostMapping("/{buyerId}/checkout")
//    public Order checkout(@PathVariable String buyerId, @RequestBody @Valid CheckoutRequest req) {
//        return checkoutService.checkout(buyerId, req);
//    }
//}






//@RestController
//@RequestMapping("/api/orders")
//@RequiredArgsConstructor
//public class OrderController {
//    private final CheckoutService checkoutService;
//    private final OrderRepository orderRepo;
//    private final OrderService adminOrderService;
//
//    @PostMapping("/{buyerId}/checkout")
//    public ApiResponse<Order> checkout(@PathVariable String buyerId, @RequestBody @Valid CheckoutRequest req) {
//        return new ApiResponse<>("Đặt hàng thành công", checkoutService.checkout(buyerId, req));
//    }
//
//    @GetMapping("/{buyerId}/history")
//    public ApiResponse<List<Order>> history(@PathVariable String buyerId) {
//        return new ApiResponse<>("Lịch sử đơn hàng", orderRepo.historyOf(buyerId));
//    }
//
//    // Giả lập callback thanh toán ONLINE thành công
//    @PostMapping("/{code}/payment/success")
//    public ApiResponse<Order> paymentSuccess(@PathVariable String code) {
//        return new ApiResponse<>("Đã xác nhận thanh toán", checkoutService.markPaid(code));
//    }
//
//    @GetMapping
//    public ApiResponse<List<Order>> list(@RequestParam(required = false) String status) {
//        return new ApiResponse<>("Danh sách đơn", adminOrderService.listAll(status));
//    }
//
//    @GetMapping("/{code}")
//    public ApiResponse<Order> detail(@PathVariable String code) {
//        return new ApiResponse<>("Chi tiết đơn", adminOrderService.getByCode(code));
//    }
//
//    @PutMapping("/{code}/status")
//    public ApiResponse<Order> updateStatus(@PathVariable String code, @RequestBody @Valid UpdateStatusRequest req) {
//        return new ApiResponse<>("Cập nhật trạng thái", adminOrderService.updateStatus(code, req));
//    }
//}









@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final CheckoutService checkoutService;
    private final OrderRepository orderRepo;
    private final OrderService adminOrderService;

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

    @PutMapping("/{orderId}/status")
    public ApiResponse<Order> updateStatus(@PathVariable String orderId, @RequestBody @Valid UpdateStatusRequest req) {
        return new ApiResponse<>("Cập nhật trạng thái", adminOrderService.updateStatus(orderId, req));
    }

    @PutMapping("/{orderId}/payment")
    public ApiResponse<Order> setPayment(@PathVariable String orderId, @RequestParam boolean paid) {
        return new ApiResponse<>("Cập nhật trạng thái thanh toán", adminOrderService.setPaymentStatus(orderId, paid));
    }
}
