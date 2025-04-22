package org.example.languagecommunication.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "refresh_tokens")
public class RefreshTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    Long id;

    private String username;

    @Column(unique = true)
    private String tokenHash;

    private Instant expiryDate;

    public RefreshTokenEntity(String username, String tokenHash, Instant expiryDate) {
        this.username = username;
        this.tokenHash = tokenHash;
        this.expiryDate = expiryDate;
    }
}
