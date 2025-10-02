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
        return new ApiResponse<>("Lấy thông tin toàn bộ sách thành công", service.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BookDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Lấy toông tin sách thành công", service.getById(id));
    }

    @PostMapping("/create")
    public ApiResponse<BookDTO> create(@RequestBody BookDTO dto) {
        return new ApiResponse<>("Thêm sách mới thành công", service.create(dto));
    }

    @PutMapping("/update/{id}")
    public ApiResponse<BookDTO> update(@PathVariable Long id, @RequestBody BookDTO dto) {
        return new ApiResponse<>("Cập nhật sách thành công", service.update(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return new ApiResponse<>("Đã xóa sách", "Xóa sách có id " + id);
    }

    @GetMapping("/search")
    public ApiResponse<List<BookDTO>> search(@RequestParam String keyword) {
        return new ApiResponse<>("Tìm thấy sách", service.search(keyword));
    }

    @PostMapping("/{bookId}/add-authors")
    public ApiResponse<BookDTO> addAuthors(@PathVariable Long bookId, @RequestBody List<Long> authorIds) {
        return new ApiResponse<>("Thêm tác giả thành công", service.addAuthors(bookId, authorIds));
    }

    @PostMapping("/{bookId}/add-categories")
    public ApiResponse<BookDTO> addCategories(@PathVariable Long bookId, @RequestBody List<Long> categoryIds) {
        return new ApiResponse<>("Thêm thể loại thành công", service.addCategories(bookId, categoryIds));
    }

    @PostMapping("/{bookId}/upload-image")
    public ApiResponse<BookDTO> uploadImage(@PathVariable Long bookId, @RequestParam("file") MultipartFile file) {
        return new ApiResponse<>("Đã tải lên hình ảnh", service.uploadImage(bookId, file, storageService));
    }
}
