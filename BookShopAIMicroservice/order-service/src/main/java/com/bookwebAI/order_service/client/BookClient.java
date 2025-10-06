package com.bookwebAI.order_service.client;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;


@FeignClient(name = "book-service")
public interface BookClient {

    @GetMapping("/api/books/{id}")
    ApiResponse<BookDto> getBook(@PathVariable("id") Long id);

    @PostMapping("/api/books/{id}/decreaseStock")
    void decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);

    @PostMapping("/api/books/{id}/increaseSale")
    void increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);
}