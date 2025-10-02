package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.ReceiptDetailDTO;
import com.bookwebAI.book_service.entity.ReceiptDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReceiptDetailMapper {
    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "bookImage", source = "book.image") // ✅ map thêm ảnh
    ReceiptDetailDTO toDTO(ReceiptDetail entity);

    List<ReceiptDetailDTO> toDTOs(List<ReceiptDetail> entities);
}
