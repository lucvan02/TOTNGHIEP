package com.bookwebAI.order_service.client;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.client.dto.BookLiteDto;
import com.bookwebAI.order_service.client.dto.RatingUpdateDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@FeignClient(name = "book-service")
public interface BookClient {

    @GetMapping("/api/books/{id}")
    ApiResponse<BookDto> getBook(@PathVariable("id") Long id);

    @PostMapping("/api/books/{id}/decreaseStock")
    void decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);

    @PostMapping("/api/books/{id}/increaseSale")
    void increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);

    @PutMapping("/api/books/{bookId}/rating-update")
    ApiResponse<Void> updateRating(@PathVariable("bookId") Long bookId,
                                   @RequestBody RatingUpdateDto dto);

    @GetMapping("/api/books/{id}")
    ApiResponse<BookLiteDto> getById(@PathVariable("id") Long id);

    // bulk nội bộ để tránh N+1
    @GetMapping("/api/books/bulk")
    ApiResponse<List<BookDto>> bulk(@RequestParam("ids") List<Long> ids);
}