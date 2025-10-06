package com.bookwebAI.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String receiveName;
    @NotBlank private String receivePhone;
    @NotBlank private String receiveAddress;
    private Integer shippingFee = 0;
    private String note;
    private String paymentMethod = "COD";
}