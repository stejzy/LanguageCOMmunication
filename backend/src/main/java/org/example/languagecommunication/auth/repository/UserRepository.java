package org.example.languagecommunication.auth.repository;

import org.example.languagecommunication.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationCode(String verificationCode);
    Optional<User> findByUsername(String username);
    List<User> findByVerificationCodeExpiresAtBeforeAndEnabledFalse(LocalDateTime expirationDate);
}
