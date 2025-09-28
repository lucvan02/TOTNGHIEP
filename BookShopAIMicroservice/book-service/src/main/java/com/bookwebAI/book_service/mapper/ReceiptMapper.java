package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.dto.ReceiptDetailDTO;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.entity.ReceiptDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiptMapper {
    @Mapping(target = "details", source = "details")
    ReceiptDTO toDTO(Receipt receipt);

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    ReceiptDetailDTO toDTO(ReceiptDetail detail);
}
