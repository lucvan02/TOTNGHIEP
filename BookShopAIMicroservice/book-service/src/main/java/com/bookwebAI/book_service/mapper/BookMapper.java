package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.*;
import com.bookwebAI.book_service.entity.Book;
import org.mapstruct.Mapper;
import java.util.List;


@Mapper(componentModel = "spring", uses = {PublisherMapper.class, AuthorMapper.class, CategoryMapper.class})
public interface BookMapper {
    BookDTO toDTO(Book entity);
    Book toEntity(BookDTO dto);
    List<BookDTO> toDTOs(List<Book> entities);
}

