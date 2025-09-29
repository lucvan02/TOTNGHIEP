package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.AuthorDTO;
import com.bookwebAI.book_service.entity.Author;
import com.bookwebAI.book_service.mapper.AuthorMapper;
import com.bookwebAI.book_service.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

//@Service
//@RequiredArgsConstructor
//public class AuthorService {
//    private final AuthorRepository repository;
//
//    public List<AuthorDTO> getAll() {
//        return repository.findAll().stream()
//                .map(a -> new AuthorDTO(a.getId(), a.getName()))
//                .toList();
//    }
//
//    public AuthorDTO getById(Long id) {
//        return repository.findById(id)
//                .map(a -> new AuthorDTO(a.getId(), a.getName()))
//                .orElse(null);
//    }
//
//    public AuthorDTO create(AuthorDTO dto) {
//        Author author = new Author(null, dto.getName());
//        Author saved = repository.save(author);
//        return new AuthorDTO(saved.getId(), saved.getName());
//    }
//
//    public AuthorDTO update(Long id, AuthorDTO dto) {
//        return repository.findById(id)
//                .map(a -> {
//                    a.setName(dto.getName());
//                    return new AuthorDTO(repository.save(a).getId(), a.getName());
//                }).orElse(null);
//    }
//
//    public void delete(Long id) {
//        repository.deleteById(id);
//    }
//}


@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository repository;
    private final AuthorMapper mapper;

    public List<AuthorDTO> getAll() {
        return mapper.toDTOs(repository.findAll());
    }

    public AuthorDTO getById(Long id) {
        return mapper.toDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found")));
    }

    public AuthorDTO create(AuthorDTO dto) {
        Author entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public AuthorDTO update(Long id, AuthorDTO dto) {
        Author entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription()); // cập nhật mô tả
        return mapper.toDTO(repository.save(entity));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
