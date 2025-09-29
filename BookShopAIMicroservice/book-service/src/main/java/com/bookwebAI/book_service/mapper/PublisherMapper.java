package com.bookwebAI.book_service.mapper;

import com.bookwebAI.book_service.dto.PublisherDTO;
import com.bookwebAI.book_service.entity.Publisher;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PublisherMapper {
    PublisherDTO toDTO(Publisher publisher);
    Publisher toEntity(PublisherDTO dto);
    List<PublisherDTO> toDTOs(List<Publisher> publishers);
}
