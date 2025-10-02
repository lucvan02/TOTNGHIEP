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

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {
    private final ReceiptService service;

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<ReceiptDTO>>> getAll() {
        List<ReceiptDTO> receipts = service.getAll();
        return ResponseEntity.ok(
                new ApiResponse<>("Lấy danh sách phiếu nhập thành công", receipts)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptDTO>> getById(@PathVariable Long id) {
        ReceiptDTO dto = service.getById(id);
        return ResponseEntity.ok(
                new ApiResponse<>("Lấy chi tiết phiếu nhập thành công", dto)
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ReceiptDTO>> create(@RequestBody ReceiptDTO dto) {
        ReceiptDTO created = service.create(dto);
        return ResponseEntity.ok(
                new ApiResponse<>("Thêm phiếu nhập thành công", created)
        );
    }
}
