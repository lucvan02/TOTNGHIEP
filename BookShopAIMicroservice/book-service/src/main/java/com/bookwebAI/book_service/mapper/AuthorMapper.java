package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.AuthorDTO;
import com.bookwebAI.book_service.entity.Author;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AuthorMapper {
    AuthorDTO toDTO(Author author);
    Author toEntity(AuthorDTO dto);
    List<AuthorDTO> toDTOs(List<Author> authors);
}
