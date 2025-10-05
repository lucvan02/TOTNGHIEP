//package com.bookwebAI.user_service.entity;
//
//import jakarta.persistence.Entity;
//
//import jakarta.persistence.Id;
//import jakarta.persistence.Table;
//import lombok.*;
//import jakarta.persistence.*;
//import java.util.UUID;
//
//@Entity
//@Table(name = "users")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class User {
//
//    @Id
//    @Column(name = "uid", columnDefinition = "BINARY(16)")
//    private UUID uid; // UUID là khóa chính luôn
//
//    @Column(unique = true, nullable = false)
//    private String username;
//
//    @Column(nullable = false)
//    private String password;
//
//    @Column(unique = true, nullable = false)
//    private String email;
//
//    private String avatar;
//    private String firstname;
//    private String lastname;
//    private String phone;
//    private boolean active = false;
//    private String role; // "USER" hoặc "ADMIN"
//
//    private String provider;   // "LOCAL" hoặc "GOOGLE"
//    private String providerId; // id Google nếu có
//
//    @PrePersist
//    public void generateUUID() {
//        if (uid == null) {
//            uid = UUID.randomUUID();
//        }
//    }
//}



package com.bookwebAI.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String uid;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;
    private String email;
    private String avatar;
    private String firstname;
    private String lastname;
    private String phone;
    @Column(columnDefinition = "TINYINT(1)")
    private boolean active;

    private String role;
}
