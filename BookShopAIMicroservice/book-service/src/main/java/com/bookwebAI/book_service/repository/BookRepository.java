package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String keyword);
    List<Book> findByCategories_Id(Long categoryId);
    List<Book> findByAuthors_Id(Long authorId);
}