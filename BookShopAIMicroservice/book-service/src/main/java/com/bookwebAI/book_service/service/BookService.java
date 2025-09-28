package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.mapper.BookMapper;
import com.bookwebAI.book_service.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository repository;
    private final BookMapper mapper;

    public List<BookDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    public BookDTO getById(Long id) {
        return repository.findById(id)
                .map(mapper::toDTO)
                .orElse(null);
    }

    public BookDTO create(BookDTO dto) {
        Book book = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(book));
    }

    public BookDTO update(Long id, BookDTO dto) {
        return repository.findById(id)
                .map(b -> {
                    b.setTitle(dto.getTitle());
                    b.setDescription(dto.getDescription());
                    b.setPrice(dto.getPrice());
                    b.setStock(dto.getStock());
                    b.setStar(dto.getStar());
                    b.setWeight(dto.getWeight());
                    b.setImage(dto.getImage());
                    // publisher, authors, categories có thể map lại
                    return mapper.toDTO(repository.save(b));
                }).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
