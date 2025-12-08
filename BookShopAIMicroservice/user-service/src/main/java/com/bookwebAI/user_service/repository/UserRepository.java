package com.bookwebAI.user_service.repository;

import com.bookwebAI.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    //ham tim theo uid
    Optional<User> findByUid(String uid);

    Page<User> findByRole(String role, Pageable pageable);

    // Search cho admin
    @Query("""
        SELECT u FROM User u
        WHERE u.role = 'USER'
          AND (
               LOWER(u.firstname) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.lastname)  LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.phone)     LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """)
    Page<User> searchUsersForAdmin(@Param("keyword") String keyword, Pageable pageable);


}
