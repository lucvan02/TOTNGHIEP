package com.bookwebAI.book_service.controller;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.bookwebAI.book_service.dto.CategoryDTO;
import com.bookwebAI.book_service.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryDTO>>builder()
                        .message("Categories retrieved successfully")
                        .data(service.getAll())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryDTO>builder()
                        .message("Category retrieved successfully")
                        .data(service.getById(id))
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody CategoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<CategoryDTO>builder()
                        .message("Lưu thể loại thành công!")
                        .data(service.create(dto))
                        .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryDTO>builder()
                        .message("Cập nhật thể loại thành công!")
                        .data(service.update(id, dto))
                        .build()
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa danh mục thành công")
                        .data(null)
                        .build()
        );
    }
}
