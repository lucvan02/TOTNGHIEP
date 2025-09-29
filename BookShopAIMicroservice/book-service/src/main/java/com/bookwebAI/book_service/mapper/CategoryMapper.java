package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.CategoryDTO;
import com.bookwebAI.book_service.entity.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO dto);
    List<CategoryDTO> toDTOs(List<Category> categories);
}

