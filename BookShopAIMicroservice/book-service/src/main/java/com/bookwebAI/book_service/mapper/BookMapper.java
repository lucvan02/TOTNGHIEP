package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.AuthorDTO;
import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.dto.CategoryDTO;
import com.bookwebAI.book_service.dto.PublisherDTO;
import com.bookwebAI.book_service.entity.Author;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.entity.Category;
import com.bookwebAI.book_service.entity.Publisher;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookMapper {
    BookDTO toDTO(Book book);
    Book toEntity(BookDTO dto);

//    PublisherDTO toDTO(Publisher publisher);
//    AuthorDTO toDTO(Author author);
//    CategoryDTO toDTO(Category category);
}
