package com.bookwebAI.user_service.repository;

import com.bookwebAI.user_service.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
//    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByEmail(String email);
    void deleteByEmail(String email);
}
