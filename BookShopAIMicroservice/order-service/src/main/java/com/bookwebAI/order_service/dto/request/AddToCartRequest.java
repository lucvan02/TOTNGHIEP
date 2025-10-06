package com.bookwebAI.order_service.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;

@Data
public class AddToCartRequest {
    @NotNull private Long bookId;
    @Min(1) private Integer quantity;
}