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
    private Integer saleQuantity;
    private float star;
    private int weight;
    private String image;

    private PublisherDTO publisher;
    private Set<AuthorDTO> authors;
    private Set<CategoryDTO> categories;

    private Integer status; // 🔹 0=Ẩn, 1=Hiển thị, 2=Ngừng kinh doanh
}


//
//public class BookDTO {
//    private Long id;
//    private String title;
//    private String description;
//    private int price;
//    private int stock;
//    private Integer saleQuantity;
//    private float star;
//    private int weight;
//    private String image;
//
//    private Long publisherId;
//    private Set<Long> authorIds;
//    private Set<Long> categoryIds;
//
//    private Integer status;
//}
