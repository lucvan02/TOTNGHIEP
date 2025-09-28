package com.bookwebAI.book_service.dto;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {
    private Long id;
    private String title;
    private String description;
    private int price;
    private int stock;
    private float star;
    private int weight;
    private String image;

    private PublisherDTO publisher;
    private Set<AuthorDTO> authors;
    private Set<CategoryDTO> categories;
}
