package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.ReceiptDTO;
import com.bookwebAI.book_service.entity.Receipt;
import com.bookwebAI.book_service.mapper.ReceiptMapper;
import com.bookwebAI.book_service.repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptService {
    private final ReceiptRepository repository;
    private final ReceiptMapper mapper;

    public List<ReceiptDTO> getAll() {
        return repository.findAll().stream().map(mapper::toDTO).toList();
    }

    public ReceiptDTO getById(Long id) {
        return repository.findById(id).map(mapper::toDTO).orElse(null);
    }

    public ReceiptDTO create(Receipt receipt) {
        return mapper.toDTO(repository.save(receipt));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
