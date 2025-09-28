package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
}
