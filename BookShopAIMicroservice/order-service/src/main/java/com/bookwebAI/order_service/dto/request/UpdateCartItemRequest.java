package com.bookwebAI.order_service.dto.request;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;

@Data
public class UpdateCartItemRequest {
    @NotNull private Long bookId;
    @Min(0)  private Integer quantity; // =0 nghĩa là xoá item
}