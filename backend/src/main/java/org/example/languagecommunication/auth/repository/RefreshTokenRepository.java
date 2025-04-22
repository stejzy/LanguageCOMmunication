package org.example.languagecommunication.auth.repository;

import org.example.languagecommunication.auth.model.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
    void deleteByUsername(String username);
}
