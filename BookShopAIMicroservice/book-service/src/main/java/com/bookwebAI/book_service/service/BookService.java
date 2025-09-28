package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.entity.Author;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.entity.Category;
import com.bookwebAI.book_service.mapper.BookMapper;
import com.bookwebAI.book_service.repository.AuthorRepository;
import com.bookwebAI.book_service.repository.BookRepository;
import com.bookwebAI.book_service.repository.CategoryRepository;
import com.bookwebAI.book_service.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

//@Service
//@RequiredArgsConstructor
//public class BookService {
//    private final BookRepository repository;
//    private final BookMapper mapper;
//
//    public List<BookDTO> getAll() {
//        return repository.findAll()
//                .stream()
//                .map(mapper::toDTO)
//                .toList();
//    }
//
//    public BookDTO getById(Long id) {
//        return repository.findById(id)
//                .map(mapper::toDTO)
//                .orElse(null);
//    }
//
//    public BookDTO create(BookDTO dto) {
//        Book book = mapper.toEntity(dto);
//        return mapper.toDTO(repository.save(book));
//    }
//
//    public BookDTO update(Long id, BookDTO dto) {
//        return repository.findById(id)
//                .map(b -> {
//                    b.setTitle(dto.getTitle());
//                    b.setDescription(dto.getDescription());
//                    b.setPrice(dto.getPrice());
//                    b.setStock(dto.getStock());
//                    b.setStar(dto.getStar());
//                    b.setWeight(dto.getWeight());
//                    b.setImage(dto.getImage());
//                    // publisher, authors, categories có thể map lại
//                    return mapper.toDTO(repository.save(b));
//                }).orElse(null);
//    }
//
//    public void delete(Long id) {
//        repository.deleteById(id);
//    }
//
//
//
//}



@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final PublisherRepository publisherRepository;
    private final BookMapper mapper;

    // Get all
    public List<BookDTO> getAll() {
        return bookRepository.findAll().stream()
                .map(mapper::toDTO)
                .toList();
    }

    // Get by id
    public BookDTO getById(Long id) {
        return bookRepository.findById(id).map(mapper::toDTO).orElse(null);
    }

    // Create
    public BookDTO create(BookDTO dto) {
        Book book = mapper.toEntity(dto);

        if (dto.getPublisherId() != null) {
            publisherRepository.findById(dto.getPublisherId())
                    .ifPresent(book::setPublisher);
        }
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(dto.getAuthorIds()));
            book.setAuthors(authors);
        }
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(dto.getCategoryIds()));
            book.setCategories(categories);
        }
        return mapper.toDTO(bookRepository.save(book));
    }

    // Update
    public BookDTO update(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return null;

        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPrice(dto.getPrice());
        book.setStock(dto.getStock());
        book.setStar(dto.getStar());
        book.setWeight(dto.getWeight());
        book.setImage(dto.getImage());

        if (dto.getPublisherId() != null) {
            publisherRepository.findById(dto.getPublisherId())
                    .ifPresent(book::setPublisher);
        }
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(dto.getAuthorIds()));
            book.setAuthors(authors);
        }
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(dto.getCategoryIds()));
            book.setCategories(categories);
        }

        return mapper.toDTO(bookRepository.save(book));
    }

    // Delete
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    // Search
    public List<BookDTO> searchByKeyword(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    // Filter by category
    public List<BookDTO> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategories_Id(categoryId)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    // Filter by author
    public List<BookDTO> getBooksByAuthor(Long authorId) {
        return bookRepository.findByAuthors_Id(authorId)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    // Update status
    public BookDTO updateStatus(Long id, Integer status) {
        Book book = bookRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Book not found with id " + id)
        );
        if (status < 0 || status > 2) {
            throw new IllegalArgumentException("Invalid status (0=HIDDEN,1=VISIBLE,2=DISCONTINUED)");
        }
        book.setStatus(status);
        return mapper.toDTO(bookRepository.save(book));
    }

    // Update image
    public BookDTO updateImage(Long id, String fileName) {
        Book book = bookRepository.findById(id).orElseThrow();
        book.setImage(fileName);
        return mapper.toDTO(bookRepository.save(book));
    }

    // Add authors
    public BookDTO addAuthors(Long bookId, Set<Long> authorIds) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) return null;
        Set<Author> authors = new HashSet<>(authorRepository.findAllById(authorIds));
        book.getAuthors().addAll(authors);
        return mapper.toDTO(bookRepository.save(book));
    }

    // Add categories
    public BookDTO addCategories(Long bookId, Set<Long> categoryIds) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) return null;
        Set<Category> categories = new HashSet<>(categoryRepository.findAllById(categoryIds));
        book.getCategories().addAll(categories);
        return mapper.toDTO(bookRepository.save(book));
    }
}
