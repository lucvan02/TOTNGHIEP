package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.dto.ReceiptDetailDTO;
import com.bookwebAI.book_service.dto.response.ApiResponse;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.entity.ReceiptDetail;
import com.bookwebAI.book_service.mapper.ReceiptMapper;
import com.bookwebAI.book_service.repository.BookRepository;
import com.bookwebAI.book_service.repository.ReceiptRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptService {
    private final ReceiptRepository receiptRepository;
    private final BookRepository bookRepository;
    private final ReceiptMapper receiptMapper;

    @Transactional
    public ReceiptDTO create(ReceiptDTO dto) {
        Receipt receipt = new Receipt();
        receipt.setCreatedAt(LocalDateTime.now());

        double total = 0.0;
        List<ReceiptDetail> details = new ArrayList<>();

        for (ReceiptDetailDTO detailDTO : dto.getReceiptDetails()) {
            Book book = bookRepository.findById(detailDTO.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            // ✅ cập nhật tồn kho
            int newStock = (book.getStock()) + detailDTO.getQuantity();
            book.setStock(newStock);
            bookRepository.save(book);

            ReceiptDetail detail = new ReceiptDetail();
            detail.setBook(book);
            detail.setQuantity(detailDTO.getQuantity());
            detail.setImportPrice(detailDTO.getImportPrice());
            detail.setReceipt(receipt);

            total += detailDTO.getQuantity() * detailDTO.getImportPrice();
            details.add(detail);
        }

        receipt.setTotal(total);
        receipt.setDetails(details);

        Receipt saved = receiptRepository.save(receipt);
        return receiptMapper.toDTO(saved);
    }


    public List<ReceiptDTO> getAll() {
        return receiptMapper.toDTOs(receiptRepository.findAll());
    }


    public ReceiptDTO getById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));
        return receiptMapper.toDTO(receipt);
    }


    @Transactional
    public ApiResponse<ReceiptDTO> importFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("File không hợp lệ");
        }

        List<ReceiptDetailDTO> details = new ArrayList<>();

        try {
            if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                // Đọc Excel
                Workbook workbook = WorkbookFactory.create(file.getInputStream());
                Sheet sheet = workbook.getSheetAt(0);

                for (int i = 1; i <= sheet.getLastRowNum(); i++) { // bỏ header
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    Long bookId = (long) row.getCell(0).getNumericCellValue();
                    int quantity = (int) row.getCell(1).getNumericCellValue();
                    double importPrice = row.getCell(2).getNumericCellValue();

                    details.add(new ReceiptDetailDTO(null, bookId, null, null, quantity, importPrice));
                }
            }
              else {
                throw new RuntimeException("Chỉ hỗ trợ Excel");
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đọc file, vui lòng chọn đúng định dạng theo mẫu: " + e.getMessage());
        }

        ReceiptDTO dto = new ReceiptDTO();
        dto.setReceiptDetails(details);
        ReceiptDTO saved = create(dto); // tái sử dụng hàm create()
        return new ApiResponse<>("Import file thành công", saved);
    }



}
