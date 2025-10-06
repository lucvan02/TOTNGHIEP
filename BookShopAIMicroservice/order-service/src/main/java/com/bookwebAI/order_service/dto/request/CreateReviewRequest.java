package com.bookwebAI.order_service.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class CreateReviewRequest {
    @NotNull private Long orderItemId;
    @Min(1) @Max(5) private Integer star;
    private String comment;
}