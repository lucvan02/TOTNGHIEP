package com.bookwebAI.book_service.repository;

import com.bookwebAI.book_service.entity.Book;
//import feign.Param;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String keyword);
//    List<Book> findByCategories_Id(Long categoryId);
//    List<Book> findByAuthors_Id(Long authorId);

    Page<Book> findByAuthors_Id(Long authorId, Pageable pageable);
    Page<Book> findByCategories_Id(Long categoryId, Pageable pageable);
    Page<Book> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    //lay sach theo nha xuat ban
    Page<Book> findByPublisher_Id(Long publisherId, Pageable pageable);

    @Query("SELECT b FROM Book b JOIN b.authors a WHERE a.id = :authorId")
    List<Book> findByAuthorId(@Param("authorId") Long authorId);

    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId")
    List<Book> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT b FROM Book b ORDER BY b.saleQuantity DESC LIMIT 10")
    List<Book> findTopBySaleQuantity();

    //Sachs co trang thai = 1 (Hien thi)
    List<Book> findByStatus(Integer status);

    //Sachs co trang thai khac 0(sách không ẩn và sách ngưng bán)
    List<Book> findByStatusNot(Integer status);

    @Query("SELECT b FROM Book b WHERE b.id IN :ids")
    List<Book> findAllByIds(@Param("ids") List<Long> ids);
}