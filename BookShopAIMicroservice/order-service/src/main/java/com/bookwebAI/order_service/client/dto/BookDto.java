package com.bookwebAI.order_service.client.dto;

import lombok.Data;


@Data
public class BookDto {
    private Long id;
    private String title;
    private String image;
    private Integer price;
    private Integer stock;
    private Float star;
    private Integer saleQuantity;
}