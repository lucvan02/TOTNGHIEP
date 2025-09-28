package com.bookwebAI.book_service.controller;

import com.bookwebAI.book_service.dto.AuthorDTO;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import com.bookwebAI.book_service.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService service;

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<AuthorDTO>>> getAllAuthors() {
        return ResponseEntity.ok(
                ApiResponse.<List<AuthorDTO>>builder()
                        .message("Authors retrieved successfully")
                        .data(service.getAll())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthorDTO>> getAuthorById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<AuthorDTO>builder()
                        .message("Author retrieved successfully")
                        .data(service.getById(id))
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AuthorDTO>> createAuthor(@RequestBody AuthorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthorDTO>builder()
                        .message("Author created successfully")
                        .data(service.create(dto))
                        .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<AuthorDTO>> updateAuthor(
            @PathVariable Long id,
            @RequestBody AuthorDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.<AuthorDTO>builder()
                        .message("Author updated successfully")
                        .data(service.update(id, dto))
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAuthor(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Author deleted successfully")
                        .data(null)
                        .build()
        );
    }
}
