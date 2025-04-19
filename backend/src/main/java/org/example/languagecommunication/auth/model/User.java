package org.example.languagecommunication.auth.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank
    @Column(unique = true)
    @Size(max = 30)
    private String username;

    @NotBlank
    @Column(unique = true)
    @Email
    @Size(max = 50)
    private String email;

    @NotBlank
    @Size(max = 100)
    private String password;

    private boolean enabled;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_expiration")
    private LocalDateTime verificationCodeExpiresAt;

    @NotBlank
    @Column(name = "auth_provider")
    private String authProvider;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        authProvider = "local";
    }
}
