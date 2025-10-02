package com.bookwebAI.book_service.controller;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.dto.response.ApiResponse;
//import com.bookwebAI.book_service.exception.GlobalExceptionHandler;
import com.bookwebAI.book_service.service.BookService;
import com.bookwebAI.book_service.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService service;
    private final FileStorageService storageService;

    @GetMapping("/get-all")
    public ApiResponse<List<BookDTO>> getAll() {
        return new ApiResponse<>("Books retrieved successfully", service.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BookDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Book retrieved successfully", service.getById(id));
    }

    @PostMapping("/create")
    public ApiResponse<BookDTO> create(@RequestBody BookDTO dto) {
        return new ApiResponse<>("Book created successfully", service.create(dto));
    }

    @PutMapping("/update/{id}")
    public ApiResponse<BookDTO> update(@PathVariable Long id, @RequestBody BookDTO dto) {
        return new ApiResponse<>("Book updated successfully", service.update(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return new ApiResponse<>("Book deleted successfully", "Deleted book with id " + id);
    }

    @GetMapping("/search")
    public ApiResponse<List<BookDTO>> search(@RequestParam String keyword) {
        return new ApiResponse<>("Books found successfully", service.search(keyword));
    }

    @PostMapping("/{bookId}/add-authors")
    public ApiResponse<BookDTO> addAuthors(@PathVariable Long bookId, @RequestBody List<Long> authorIds) {
        return new ApiResponse<>("Authors added successfully", service.addAuthors(bookId, authorIds));
    }

    @PostMapping("/{bookId}/add-categories")
    public ApiResponse<BookDTO> addCategories(@PathVariable Long bookId, @RequestBody List<Long> categoryIds) {
        return new ApiResponse<>("Categories added successfully", service.addCategories(bookId, categoryIds));
    }

    @PostMapping("/{bookId}/upload-image")
    public ApiResponse<BookDTO> uploadImage(@PathVariable Long bookId, @RequestParam("file") MultipartFile file) {
        return new ApiResponse<>("Image uploaded successfully", service.uploadImage(bookId, file, storageService));
    }
}
