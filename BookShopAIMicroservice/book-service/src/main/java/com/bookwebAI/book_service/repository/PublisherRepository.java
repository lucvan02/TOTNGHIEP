package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {

}
