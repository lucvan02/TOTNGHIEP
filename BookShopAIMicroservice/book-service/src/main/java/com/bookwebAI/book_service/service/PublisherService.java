package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.PublisherDTO;
import com.bookwebAI.book_service.entity.Publisher;
import com.bookwebAI.book_service.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherService {
    private final PublisherRepository repository;

    public List<PublisherDTO> getAll() {
        return repository.findAll().stream()
                .map(a -> new PublisherDTO(a.getId(), a.getName()))
                .toList();
    }

    public PublisherDTO getById(Long id) {
        return repository.findById(id)
                .map(a -> new PublisherDTO(a.getId(), a.getName()))
                .orElse(null);
    }

    public PublisherDTO create(PublisherDTO dto) {
        Publisher Publisher = new Publisher(null, dto.getName());
        Publisher saved = repository.save(Publisher);
        return new PublisherDTO(saved.getId(), saved.getName());
    }

    public PublisherDTO update(Long id, PublisherDTO dto) {
        return repository.findById(id)
                .map(a -> {
                    a.setName(dto.getName());
                    return new PublisherDTO(repository.save(a).getId(), a.getName());
                }).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
