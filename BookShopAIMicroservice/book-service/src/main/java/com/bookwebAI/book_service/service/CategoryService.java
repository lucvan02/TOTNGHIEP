package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.CategoryDTO;
import com.bookwebAI.book_service.entity.Category;
import com.bookwebAI.book_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repository;

    public List<CategoryDTO> getAll() {
        return repository.findAll().stream()
                .map(a -> new CategoryDTO(a.getId(), a.getName()))
                .toList();
    }

    public CategoryDTO getById(Long id) {
        return repository.findById(id)
                .map(a -> new CategoryDTO(a.getId(), a.getName()))
                .orElse(null);
    }

    public CategoryDTO create(CategoryDTO dto) {
        Category Category = new Category(null, dto.getName());
        Category saved = repository.save(Category);
        return new CategoryDTO(saved.getId(), saved.getName());
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        return repository.findById(id)
                .map(a -> {
                    a.setName(dto.getName());
                    return new CategoryDTO(repository.save(a).getId(), a.getName());
                }).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
