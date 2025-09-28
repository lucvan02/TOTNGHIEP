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
import org.mapstruct.Mapping;

//@Mapper(componentModel = "spring")
//public interface BookMapper {
//    BookDTO toDTO(Book book);
//    Book toEntity(BookDTO dto);
//
////    PublisherDTO toDTO(Publisher publisher);
////    AuthorDTO toDTO(Author author);
////    CategoryDTO toDTO(Category category);
//}



@Mapper(componentModel = "spring")
public interface BookMapper {
//    @Mapping(target = "publisherId", source = "publisher.id")
//    @Mapping(target = "authorIds", expression = "java(book.getAuthors().stream().map(Author::getId).collect(java.util.stream.Collectors.toSet()))")
//    @Mapping(target = "categoryIds", expression = "java(book.getCategories().stream().map(Category::getId).collect(java.util.stream.Collectors.toSet()))")
    BookDTO toDTO(Book book);

//    @Mapping(target = "publisher", ignore = true)
//    @Mapping(target = "authors", ignore = true)
//    @Mapping(target = "categories", ignore = true)
    Book toEntity(BookDTO dto);
}
