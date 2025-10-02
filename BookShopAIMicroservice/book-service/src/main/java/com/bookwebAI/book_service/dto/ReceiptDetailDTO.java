package com.bookwebAI.book_service.dto;
import lombok.*;

//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class ReceiptDetailDTO {
//    private Long id;
//    private int quantity;
//    private int price;
//    private Long bookId;       // chỉ cần bookId thay vì Book đầy đủ
//    private String bookTitle;  // thêm tên sách cho dễ hiển thị
//}



@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReceiptDetailDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookImage;   // ✅ thêm ảnh sách
    private Integer quantity;
    private Double importPrice;
}
