package com.bookwebAI.book_service.entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

//@Entity
//@Table(name = "books")
//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class Book {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String title;
//
//    @Column(length = 1000)
//    private String description;
//
//    private int price;
//    private int stock;
//    private float star;
//    private int weight;
//    private String image;
//
//    @ManyToOne
//    @JoinColumn(name = "publisher_id")
//    private Publisher publisher;
//
//    @ManyToMany
//    @JoinTable(
//            name = "author_book",
//            joinColumns = @JoinColumn(name = "book_id"),
//            inverseJoinColumns = @JoinColumn(name = "author_id")
//    )
//    private Set<Author> authors = new HashSet<>();
//
//    @ManyToMany
//    @JoinTable(
//            name = "book_category",
//            joinColumns = @JoinColumn(name = "book_id"),
//            inverseJoinColumns = @JoinColumn(name = "category_id")
//    )
//    private Set<Category> categories = new HashSet<>();
//}


@Entity
@Table(name = "books")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private int price;
    private int stock;
    private float star;
    private int weight;
    private String image;

    @ManyToOne
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @ManyToMany
    @JoinTable(
            name = "author_book",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private Set<Author> authors = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "book_category",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    // 🔹 Status: 0=HIDDEN, 1=VISIBLE, 2=DISCONTINUED
    private Integer status = 1;
}
