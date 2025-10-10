package com.bookwebAI.book_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingUpdateDto {
    private Double average; // ví dụ 4.6
    private Long count;     // tổng số review
}