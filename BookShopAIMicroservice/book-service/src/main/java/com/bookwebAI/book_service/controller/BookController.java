package com.bookwebAI.book_service.controller;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.dto.RatingUpdateDto;
import com.bookwebAI.book_service.dto.response.ApiResponse;
//import com.bookwebAI.book_service.exception.GlobalExceptionHandler;
import com.bookwebAI.book_service.service.BookService;
import com.bookwebAI.book_service.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;



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

    @GetMapping("/get-all-not-hidden")
    public ApiResponse<List<BookDTO>> getAllNotHidden() {
        return new ApiResponse<>("Lấy thông tin toàn bộ sách không ẩn thành công", service.getAllNotHidden());
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

//    @PostMapping("/{bookId}/upload-image")
//    public ApiResponse<BookDTO> uploadImage(@PathVariable Long bookId, @RequestParam("file") MultipartFile file) {
//        return new ApiResponse<>("Đã tải lên hình ảnh", service.uploadImage(bookId, file, storageService));
//    }

    @PostMapping("/{bookId}/upload-image")
    public ApiResponse<BookDTO> uploadImage(@PathVariable Long bookId, @RequestParam("file") MultipartFile file) {
        return new ApiResponse<>("Đã tải lên hình ảnh", service.uploadImage(bookId, file));
    }


//    @GetMapping("/by-author/{authorId}")
//    public ResponseEntity<ApiResponse<List<BookDTO>>> getByAuthor(@PathVariable Long authorId) {
//        return ResponseEntity.ok(new ApiResponse<>("Lấy sách theo tác giả thành công", service.getByAuthor(authorId)));
//    }
//
//
//    @GetMapping("/by-category/{categoryId}")
//    public ResponseEntity<ApiResponse<List<BookDTO>>> getByCategory(@PathVariable Long categoryId) {
//        return ResponseEntity.ok(new ApiResponse<>("Lấy sách theo thể loại thành công", service.getByCategory(categoryId)));
//    }

    @GetMapping("/by-author/{authorId}")
    public ResponseEntity<ApiResponse<Page<BookDTO>>> getByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(
                new ApiResponse<>("Lấy sách theo tác giả thành công", service.getByAuthor(authorId, page, size))
        );
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<BookDTO>>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(
                new ApiResponse<>("Lấy sách theo thể loại thành công", service.getByCategory(categoryId, page, size))
        );
    }

    @GetMapping("/by-publisher/{publisherId}")
    public ResponseEntity<ApiResponse<Page<BookDTO>>> getByPublisher(
            @PathVariable Long publisherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(
                new ApiResponse<>("Lấy sách theo nhà xuất bản thành công", service.getByPublisher(publisherId, page, size))
        );
    }


    // Top bán chạy
    @GetMapping("/top-sale")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getTopSale() {
        return ResponseEntity.ok(new ApiResponse<>("Top sách bán chạy", service.getTopSale()));
    }

//    @PostMapping("/{id}/decreaseStock")
//    public ApiResponse<String> decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
//        service.decreaseStock(id, qty);
//        return new ApiResponse<>("Đã giảm tồn kho", "Giảm tồn kho cho sách có id " + id);
//    }
//
//    @PostMapping("/{id}/increaseSale")
//    public ApiResponse<String> increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
//        service.increaseSale(id, qty);
//        return new ApiResponse<>("Đã tăng số lượng bán", "Tăng số lượng bán cho sách có id " + id);
//    }

    @PostMapping("/{id}/decreaseStock")
    public void decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
        service.decreaseStock(id, qty);
    }

    @PostMapping("/{id}/increaseSale")
    public void increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
        service.increaseSale(id, qty);
    }

    @PutMapping("/{bookId}/rating-update")
    public ApiResponse<String> updateRating(@PathVariable Long bookId, @RequestBody RatingUpdateDto dto) {
        service.updateRating(bookId, dto.getAverage(), dto.getCount());
        return new ApiResponse<>("OK", "updated");
    }

    @GetMapping("/bulk")
    public ApiResponse<List<BookDTO>> bulk(@RequestParam("ids") List<Long> ids) {
        // Spring tự parse "1,2,5" -> List<Long> {1,2,5}
        return new ApiResponse<>("OK", service.bulkByIds(ids));
    }


}
