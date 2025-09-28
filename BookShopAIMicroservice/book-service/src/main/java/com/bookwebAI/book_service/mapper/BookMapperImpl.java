//package com.bookwebAI.book_service.mapper;
//
//import com.bookwebAI.book_service.dto.BookDTO;
//import com.bookwebAI.book_service.entity.Book;
//import org.springframework.stereotype.Component;
//
//@Component
//public class BookMapperImpl implements BookMapper {
//    @Override
//    public BookDTO toDTO(Book book) {
//        if (book == null) return null;
//        return BookDTO.builder()
//                .id(book.getId())
//                .title(book.getTitle())
//                .description(book.getDescription())
//                .price(book.getPrice())
//                .stock(book.getStock())
//                .star(book.getStar())
//                .weight(book.getWeight())
//                .image(book.getImage())
//                .build();
//    }
//
//    @Override
//    public Book toEntity(BookDTO dto) {
//        if (dto == null) return null;
//        return Book.builder()
//                .id(dto.getId())
//                .title(dto.getTitle())
//                .description(dto.getDescription())
//                .price(dto.getPrice())
//                .stock(dto.getStock())
//                .star(dto.getStar())
//                .weight(dto.getWeight())
//                .image(dto.getImage())
//                .build();
//    }
//}
