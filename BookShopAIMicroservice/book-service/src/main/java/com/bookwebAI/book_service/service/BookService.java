package com.bookwebAI.book_service.service;

import com.bookwebAI.book_service.dto.BookDTO;
import com.bookwebAI.book_service.entity.Author;
import com.bookwebAI.book_service.entity.Book;
import com.bookwebAI.book_service.entity.Category;
import com.bookwebAI.book_service.entity.Publisher;
import com.bookwebAI.book_service.mapper.BookMapper;
import com.bookwebAI.book_service.repository.AuthorRepository;
import com.bookwebAI.book_service.repository.BookRepository;
import com.bookwebAI.book_service.repository.CategoryRepository;
import com.bookwebAI.book_service.repository.PublisherRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;


import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookMapper bookMapper;
    private final CloudinaryService cloudinaryService;

    public List<BookDTO> getAll() {
        return bookMapper.toDTOs(bookRepository.findAll());
    }

    //lay sach co trang thai =khac 0 (khong an va ngung ban)
    public List<BookDTO> getAllNotHidden() {
        return bookMapper.toDTOs(bookRepository.findByStatusNot(0));
    }

    public BookDTO getById(Long id) {
        return bookRepository.findById(id)
                .map(bookMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public BookDTO create(BookDTO dto) {
        Book book = bookMapper.toEntity(dto);
        book.setStock(0);
        book.setSaleQuantity(0);
        book.setStatus(0); // default HIDDEN
        return bookMapper.toDTO(bookRepository.save(book));
    }



    public BookDTO update(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // cập nhật các field cơ bản
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPrice(dto.getPrice());
        book.setWeight(dto.getWeight());
        book.setStar(dto.getStar());
        book.setStatus(dto.getStatus());

        // cập nhật publisher
        if (dto.getPublisher() != null && dto.getPublisher().getId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisher().getId())
                    .orElseThrow(() -> new RuntimeException("Publisher not found"));
            book.setPublisher(publisher);
        } else {
            book.setPublisher(null);
        }

        // cập nhật authors (replace toàn bộ)
        if (dto.getAuthors() != null) {
            Set<Author> authors = dto.getAuthors().stream()
                    .map(a -> authorRepository.findById(a.getId())
                            .orElseThrow(() -> new RuntimeException("Author not found")))
                    .collect(Collectors.toSet());
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }

        // cập nhật categories (replace toàn bộ)
        if (dto.getCategories() != null) {
            Set<Category> categories = dto.getCategories().stream()
                    .map(c -> categoryRepository.findById(c.getId())
                            .orElseThrow(() -> new RuntimeException("Category not found")))
                    .collect(Collectors.toSet());
            book.setCategories(categories);
        } else {
            book.setCategories(new HashSet<>());
        }

        return bookMapper.toDTO(bookRepository.save(book));
    }


    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    public List<BookDTO> search(String keyword) {
        return bookMapper.toDTOs(bookRepository.findByTitleContainingIgnoreCase(keyword));
    }

    public BookDTO addAuthors(Long bookId, List<Long> authorIds) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        Set<Author> authors = authorIds.stream()
                .map(aid -> authorRepository.findById(aid)
                        .orElseThrow(() -> new RuntimeException("Author not found")))
                .collect(Collectors.toSet());
        book.getAuthors().addAll(authors);
        return bookMapper.toDTO(bookRepository.save(book));
    }

    public BookDTO addCategories(Long bookId, List<Long> categoryIds) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        Set<Category> categories = categoryIds.stream()
                .map(cid -> categoryRepository.findById(cid)
                        .orElseThrow(() -> new RuntimeException("Category not found")))
                .collect(Collectors.toSet());
        book.getCategories().addAll(categories);
        return bookMapper.toDTO(bookRepository.save(book));
    }

//    public BookDTO uploadImage(Long bookId, MultipartFile file, FileStorageService storageService) {
//        Book book = bookRepository.findById(bookId)
//                .orElseThrow(() -> new RuntimeException("Book not found"));
//        String imagePath = storageService.saveFile(file);
//        book.setImage(imagePath);
//        return bookMapper.toDTO(bookRepository.save(book));
//    }

    public BookDTO uploadImage(Long bookId, MultipartFile file) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        // Upload lên Cloudinary
        String imageUrl = cloudinaryService.uploadFile(file, "bookshop/books");

        book.setImage(imageUrl);
        return bookMapper.toDTO(bookRepository.save(book));
    }


//    public List<BookDTO> getByAuthor(Long authorId) {
//        return bookMapper.toDTOList(bookRepository.findByAuthorId(authorId));
//    }
//
//
//    public List<BookDTO> getByCategory(Long categoryId) {
//        return bookMapper.toDTOList(bookRepository.findByCategoryId(categoryId));
//    }

    public Page<BookDTO> getByAuthor(Long authorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findByAuthors_Id(authorId, pageable);
        return bookPage.map(bookMapper::toDTO);
    }

    public Page<BookDTO> getByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findByCategories_Id(categoryId, pageable);
        return bookPage.map(bookMapper::toDTO);
    }

    //tạo hàm lấy sách theo nhà xuất bản
    public Page<BookDTO> getByPublisher(Long publisherId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findByPublisher_Id(publisherId, pageable);
        return bookPage.map(bookMapper::toDTO);
    }



    public List<BookDTO> getTopSale() {
        return bookMapper.toDTOList(bookRepository.findTopBySaleQuantity());
    }

    //tạo hàm giảm stock sách
    @Transactional
    public void decreaseStock(Long id, Integer qty) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        if (book.getStock() < qty) {
            throw new IllegalArgumentException("Not enough stock");
        } else {
            book.setStock(book.getStock() - qty);
            bookRepository.save(book);
        }
    }

    //tạo hàm tăng số lượng bán của sách
    @Transactional
    public void increaseSale(Long id, Integer qty) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setSaleQuantity(book.getSaleQuantity() + qty);
        bookRepository.save(book);
    }

    @Transactional
    public void updateRating(Long bookId, Double newAvg, Long newCount) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setStar(newAvg.floatValue());
        bookRepository.save(book);
    }

    public List<BookDTO> bulkByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
//        return bookMapper.toDTOs(bookRepository.findAllByIds(ids));
        return bookRepository.findAllByIds(ids).stream().map(bookMapper::toDTO).toList();
    }

}
