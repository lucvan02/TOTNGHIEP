package com.bookwebAI.book_service.controller;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.dto.response.ApiResponse;
//import com.bookwebAI.book_service.exception.GlobalExceptionHandler;
import com.bookwebAI.book_service.service.BookService;
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

//@RestController
//@RequestMapping("/api/books")
//@RequiredArgsConstructor
//public class BookController {
//
//    private final BookService service;
//
//    @GetMapping("/get-all")
//    public ResponseEntity<ApiResponse<List<BookDTO>>> getAllBooks() {
//        return ResponseEntity.ok(
//                ApiResponse.<List<BookDTO>>builder()
//                        .message("Books retrieved successfully")
//                        .data(service.getAll())
//                        .build()
//        );
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<ApiResponse<BookDTO>> getBookById(@PathVariable Long id) {
//        return ResponseEntity.ok(
//                ApiResponse.<BookDTO>builder()
//                        .message("Book retrieved successfully")
//                        .data(service.getById(id))
//                        .build()
//        );
//    }
//
//    @PostMapping("/create")
//    public ResponseEntity<ApiResponse<BookDTO>> createBook(@RequestBody BookDTO dto) {
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(ApiResponse.<BookDTO>builder()
//                        .message("Book created successfully")
//                        .data(service.create(dto))
//                        .build());
//    }
//
//    @PutMapping("/update/{id}")
//    public ResponseEntity<ApiResponse<BookDTO>> updateBook(
//            @PathVariable Long id,
//            @RequestBody BookDTO dto) {
//        return ResponseEntity.ok(
//                ApiResponse.<BookDTO>builder()
//                        .message("Book updated successfully")
//                        .data(service.update(id, dto))
//                        .build()
//        );
//    }
//
//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
//        service.delete(id);
//        return ResponseEntity.ok(
//                ApiResponse.<Void>builder()
//                        .message("Book deleted successfully")
//                        .data(null)
//                        .build()
//        );
//    }
//}



@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService service;
    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getAllBooks() {
        return ResponseEntity.ok(
                ApiResponse.<List<BookDTO>>builder()
                        .message("Books retrieved successfully")
                        .data(service.getAll())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Book retrieved successfully")
                        .data(service.getById(id))
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookDTO>> createBook(@RequestBody BookDTO dto) {
        BookDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<BookDTO>builder()
                        .message("Book created successfully")
                        .data(created)
                        .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> updateBook(
            @PathVariable Long id,
            @RequestBody BookDTO dto) {
        BookDTO updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Book updated successfully")
                        .data(updated)
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Book deleted successfully")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BookDTO>>> searchBooks(@RequestParam String keyword) {
        return ResponseEntity.ok(
                ApiResponse.<List<BookDTO>>builder()
                        .message("Books found by keyword")
                        .data(service.searchByKeyword(keyword))
                        .build()
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getBooksByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(
                ApiResponse.<List<BookDTO>>builder()
                        .message("Books by category retrieved")
                        .data(service.getBooksByCategory(categoryId))
                        .build()
        );
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getBooksByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(
                ApiResponse.<List<BookDTO>>builder()
                        .message("Books by author retrieved")
                        .data(service.getBooksByAuthor(authorId))
                        .build()
        );
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        BookDTO updated = service.updateStatus(id, status);
        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Book status updated successfully")
                        .data(updated)
                        .build()
        );
    }

    @PostMapping("/upload-image/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadPath + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        System.out.println("📂 Saved file to: " + path.toAbsolutePath());

        BookDTO updated = service.updateImage(id, fileName);

        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Image uploaded successfully")
                        .data(updated)
                        .build()
        );
    }

    @PostMapping("/{bookId}/add-authors")
    public ResponseEntity<ApiResponse<BookDTO>> addAuthorsToBook(
            @PathVariable Long bookId,
            @RequestBody Set<Long> authorIds) {
        BookDTO updated = service.addAuthors(bookId, authorIds);
        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Authors added to book successfully")
                        .data(updated)
                        .build());
    }

    @PostMapping("/{bookId}/add-categories")
    public ResponseEntity<ApiResponse<BookDTO>> addCategoriesToBook(
            @PathVariable Long bookId,
            @RequestBody Set<Long> categoryIds) {
        BookDTO updated = service.addCategories(bookId, categoryIds);
        return ResponseEntity.ok(
                ApiResponse.<BookDTO>builder()
                        .message("Categories added to book successfully")
                        .data(updated)
                        .build());
    }
}
