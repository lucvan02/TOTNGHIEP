package com.bookwebAI.book_service.controller;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import com.bookwebAI.book_service.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.service.ReceiptService;

import java.util.List;

//@RestController
//@RequestMapping("/receipts")
//@RequiredArgsConstructor
//public class ReceiptController {
//
//    private final ReceiptService service;
//
//    @GetMapping
//    public ResponseEntity<ApiResponse<List<ReceiptDTO>>> getAll() {
//        List<ReceiptDTO> receipts = service.getAll();
//        if (receipts.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NO_CONTENT)
//                    .body(ApiResponse.<List<ReceiptDTO>>builder()
//                            .message("No receipts found")
//                            .data(null)
//                            .build());
//        }
//        return ResponseEntity.ok(
//                ApiResponse.<List<ReceiptDTO>>builder()
//                        .message("Receipts retrieved successfully")
//                        .data(receipts)
//                        .build()
//        );
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<ApiResponse<ReceiptDTO>> getById(@PathVariable Long id) {
//        ReceiptDTO receipt = service.getById(id);
//        if (receipt == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(ApiResponse.<ReceiptDTO>builder()
//                            .message("Receipt not found with id " + id)
//                            .data(null)
//                            .build());
//        }
//        return ResponseEntity.ok(
//                ApiResponse.<ReceiptDTO>builder()
//                        .message("Receipt retrieved successfully")
//                        .data(receipt)
//                        .build());
//    }
//
//    @PostMapping
//    public ResponseEntity<ApiResponse<ReceiptDTO>> create(@RequestBody Receipt receipt) {
//        ReceiptDTO created = service.create(receipt);
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(ApiResponse.<ReceiptDTO>builder()
//                        .message("Đã tạo phiếu nhập")
//                        .data(created)
//                        .build());
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
//        ReceiptDTO receipt = service.getById(id);
//        if (receipt == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(ApiResponse.<Void>builder()
//                            .message("Receipt not found with id " + id)
//                            .data(null)
//                            .build());
//        }
//        service.delete(id);
//        return ResponseEntity.status(HttpStatus.NO_CONTENT)
//                .body(ApiResponse.<Void>builder()
//                        .message("Đã xóa phiếu nhập")
//                        .data(null)
//                        .build());
//    }
//}





@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {
    private final ReceiptService service;

    @GetMapping("/get-all")
    public ResponseEntity<List<ReceiptDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<ReceiptDTO> create(@RequestBody ReceiptDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
