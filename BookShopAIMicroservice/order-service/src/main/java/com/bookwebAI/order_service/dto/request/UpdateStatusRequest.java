package com.bookwebAI.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotBlank
    private String status;        // CONFIRMED/SHIPPED/COMPLETED/CANCELLED/PAID
    private String cancelReason;
}