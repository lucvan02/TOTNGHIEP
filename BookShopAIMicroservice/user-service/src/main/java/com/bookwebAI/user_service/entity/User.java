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
    private String uid;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String firstname;
    private String lastname;
    private String phone;
    //them do dai avatar
    @Column(length = 2550)
    private String avatar;
    private String role;

    @Column(columnDefinition = "TINYINT(1)")
    private boolean active;

    // NEW
    private String provider;   // LOCAL, GOOGLE, LOCAL+GOOGLE
    private String providerId; // Google user ID
}
