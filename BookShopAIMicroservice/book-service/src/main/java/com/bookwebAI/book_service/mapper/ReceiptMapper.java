package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.dto.ReceiptDetailDTO;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.entity.ReceiptDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;



//@Mapper(componentModel = "spring")
//public interface ReceiptMapper {
//    @Mapping(target = "receiptDetails", source = "details")
//    ReceiptDTO toDTO(Receipt entity);
//
//    List<ReceiptDTO> toDTOs(List<Receipt> entities);
//}


@Mapper(componentModel = "spring", uses = {ReceiptDetailMapper.class})
public interface ReceiptMapper {
    @Mapping(target = "receiptDetails", source = "details")
    ReceiptDTO toDTO(Receipt entity);

    List<ReceiptDTO> toDTOs(List<Receipt> entities);
}
