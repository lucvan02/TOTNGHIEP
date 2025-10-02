package com.bookwebAI.book_service.controller;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import com.bookwebAI.book_service.service.AuthorService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.service.ReceiptService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<ReceiptDTO>> importFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.importFile(file));
    }


    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Mẫu Phiếu Nhập");

        // Header tiếng Việt
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Mã sách");
        header.createCell(1).setCellValue("Tên sách");
        header.createCell(2).setCellValue("Số lượng nhập");
        header.createCell(3).setCellValue("Giá nhập");

        // Ví dụ
        Row sample = sheet.createRow(1);
        sample.createCell(0).setCellValue(1);
        sample.createCell(1).setCellValue("Lập trình Java cơ bản");
        sample.createCell(2).setCellValue(10);
        sample.createCell(3).setCellValue(50000);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=mau_phieu_nhap.xlsx");

        workbook.write(response.getOutputStream());
        workbook.close();
    }


}
