package com.bookwebAI.book_service.controller;
import com.bookwebAI.book_service.dto.PublisherDTO;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import com.bookwebAI.book_service.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherController {

    private final PublisherService service;

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<PublisherDTO>>> getAllPublishers() {
        return ResponseEntity.ok(
                ApiResponse.<List<PublisherDTO>>builder()
                        .message("Publishers retrieved successfully")
                        .data(service.getAll())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PublisherDTO>> getPublisherById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<PublisherDTO>builder()
                        .message("Publisher retrieved successfully")
                        .data(service.getById(id))
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PublisherDTO>> createPublisher(@RequestBody PublisherDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<PublisherDTO>builder()
                        .message("Publisher created successfully")
                        .data(service.create(dto))
                        .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<PublisherDTO>> updatePublisher(
            @PathVariable Long id,
            @RequestBody PublisherDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.<PublisherDTO>builder()
                        .message("Publisher updated successfully")
                        .data(service.update(id, dto))
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePublisher(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Publisher deleted successfully")
                        .data(null)
                        .build()
        );
    }
}
