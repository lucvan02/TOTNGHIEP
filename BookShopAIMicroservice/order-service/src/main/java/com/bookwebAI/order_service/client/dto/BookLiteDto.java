package com.bookwebAI.order_service.client.dto;

import lombok.*;

@Getter @Setter
public class BookLiteDto {
    private Long id;
    private String title;
    private String image;
    private Long price;
}
