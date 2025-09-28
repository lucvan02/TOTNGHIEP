package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
