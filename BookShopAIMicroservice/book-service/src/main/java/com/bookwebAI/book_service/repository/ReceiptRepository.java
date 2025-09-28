package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
}
