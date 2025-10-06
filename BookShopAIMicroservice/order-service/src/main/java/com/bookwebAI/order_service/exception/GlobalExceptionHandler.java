//package com.bookwebAI.order_service.exception;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.MethodArgumentNotValidException;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//
//import java.util.HashMap;
//import java.util.Map;
//
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
//        Map<String, Object> body = new HashMap<>();
//        body.put("error", "VALIDATION_ERROR");
//        body.put("message", ex.getBindingResult().getFieldError() != null ?
//                ex.getBindingResult().getFieldError().getDefaultMessage() : "Invalid request");
//        return ResponseEntity.badRequest().body(body);
//    }
//
//
//    @ExceptionHandler(SecurityException.class)
//    public ResponseEntity<?> handleSecurity(SecurityException ex) {
//        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
//                "error", "FORBIDDEN",
//                "message", ex.getMessage()
//        ));
//    }
//
//
//    @ExceptionHandler(IllegalArgumentException.class)
//    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException ex) {
//        return ResponseEntity.badRequest().body(Map.of(
//                "error", "BAD_REQUEST",
//                "message", ex.getMessage()
//        ));
//    }
//
//
//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
//                "error", "SERVER_ERROR",
//                "message", ex.getMessage()
//        ));
//    }
//}