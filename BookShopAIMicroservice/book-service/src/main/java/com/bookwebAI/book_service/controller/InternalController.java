//package com.bookwebAI.book_service.controller;
//
//import com.bookwebAI.book_service.dto.response.ApiResponse;
//import org.springframework.web.bind.annotation.*;
//
//public class InternalController {
//
//    //    @PostMapping("/{id}/decreaseStock")
////    public ApiResponse<String> decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
////        service.decreaseStock(id, qty);
////        return new ApiResponse<>("Đã giảm tồn kho", "Giảm tồn kho cho sách có id " + id);
////    }
////
////    @PostMapping("/{id}/increaseSale")
////    public ApiResponse<String> increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
////        service.increaseSale(id, qty);
////        return new ApiResponse<>("Đã tăng số lượng bán", "Tăng số lượng bán cho sách có id " + id);
////    }
//
//    @PostMapping("/{id}/decreaseStock")
//    public void decreaseStock(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
//        service.decreaseStock(id, qty);
//    }
//
//    @PostMapping("/{id}/increaseSale")
//    public void increaseSale(@PathVariable("id") Long id, @RequestParam("qty") Integer qty) {
//        service.increaseSale(id, qty);
//    }
//
//    @PutMapping("/{bookId}/rating")
//    public ApiResponse<String> updateRating(@PathVariable Long bookId, @RequestBody RatingUpdateDto dto) {
//        bookService.updateRating(bookId, dto.getAverage(), dto.getCount());
//        return new ApiResponse<>("OK", "updated");
//    }
//}
