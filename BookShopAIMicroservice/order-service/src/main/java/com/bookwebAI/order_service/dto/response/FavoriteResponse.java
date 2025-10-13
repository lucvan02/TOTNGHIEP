//package com.bookwebAI.order_service.dto.response;
//
//import lombok.*;
//import java.time.LocalDateTime;
//
//@Getter @Setter @Builder
//public class FavoriteResponse {
//    private Long id;
//    private Long bookId;
//    private String bookTitle;
//    private String bookImage;
//    private Long price;
//    private LocalDateTime createdAt;
//}


// dto/response/FavoriteResponse.java
package com.bookwebAI.order_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class FavoriteResponse {
    private Long id;
    private Long bookId;

    // hiển thị cuối cùng (ưu tiên live)
    private String title;
    private String image;
    private Long price;

    // info “sống” từ BookDto
    private Integer stock;
    private Integer status;           // 1 = hiển thị, khác 1 = ẩn/ngừng bán (tuỳ book-service)
    private Float star;

    // cờ cho FE biết có phải live không
    private boolean live;

    // snapshot để fallback/debug
    private String snapshotTitle;
    private String snapshotImage;
    private Long snapshotPrice;

    private LocalDateTime createdAt;
}
