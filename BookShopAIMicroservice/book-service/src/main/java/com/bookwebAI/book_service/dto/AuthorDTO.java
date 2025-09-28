package com.bookwebAI.book_service.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthorDTO {
    private Long id;
    private String name;
}
