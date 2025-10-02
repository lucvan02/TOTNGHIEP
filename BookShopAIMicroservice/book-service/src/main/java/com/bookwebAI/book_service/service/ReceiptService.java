package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.dto.ReceiptDetailDTO;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.entity.ReceiptDetail;
import com.bookwebAI.book_service.mapper.ReceiptMapper;
import com.bookwebAI.book_service.repository.BookRepository;
import com.bookwebAI.book_service.repository.ReceiptRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
