//package com.bookwebAI.book_service.exception;
//
//import com.bookwebAI.book_service.dto.response.ApiResponse;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    // Xử lý lỗi chung (RuntimeException, IllegalArgumentException, v.v.)
//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
//        ApiResponse<Void> response = ApiResponse.<Void>builder()
//                .status(HttpStatus.BAD_REQUEST.value())
//                .message(ex.getMessage())
//                .data(null)
//                .build();
//        return ResponseEntity.badRequest().body(response);
//    }
//
//    // Xử lý lỗi NotFound (tự tạo custom exception)
//    @ExceptionHandler(ResourceNotFoundException.class)
//    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
//        ApiResponse<Void> response = ApiResponse.<Void>builder()
//                .status(HttpStatus.NOT_FOUND.value())
//                .message(ex.getMessage())
//                .data(null)
//                .build();
//        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//    }
//
//    // Xử lý lỗi chung chung
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
//        ApiResponse<Void> response = ApiResponse.<Void>builder()
//                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
//                .message("Unexpected error: " + ex.getMessage())
//                .data(null)
//                .build();
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//    }
//
//    public static class ResourceNotFoundException extends RuntimeException {
//        public ResourceNotFoundException(String message) {
//            super(message);
//        }
//    }
//
//}
