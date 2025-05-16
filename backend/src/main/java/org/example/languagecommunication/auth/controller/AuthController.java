package org.example.languagecommunication.auth.controller;

import jakarta.validation.Valid;
import org.apache.http.auth.InvalidCredentialsException;
import org.example.languagecommunication.auth.dto.*;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.service.AuthService;
import org.example.languagecommunication.auth.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final MessageSource messageSource;

    @Value("${app.jwt.refresh-expiration-time}")
    private Long refreshExpirationTime;

    @Autowired
    public AuthController(AuthService authService, AuthenticationManager authManager, JwtService jwtService, MessageSource messageSource) {
        this.authService = authService;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.messageSource = messageSource;
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterDTO registerDTO, Locale locale) {
        try {
            User user = new User(registerDTO.getUsername(), registerDTO.getEmail(), registerDTO.getPassword());
            authService.register(user);
            String msg = messageSource.getMessage("register.success", null, locale);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            String msg = messageSource.getMessage("register.error", null, locale);
            return ResponseEntity.badRequest().body(msg);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestBody VerificationRequest request, Locale locale) {
        try {
            authService.verifyUser(request.getEmail(), request.getCode());
            String msg = messageSource.getMessage("verify.success", null, locale);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            String msg = messageSource.getMessage("verify.error", null, locale);
            return ResponseEntity.badRequest().body(msg);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody UserDTO user, Locale locale) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            user.getPassword()
                    )
            );
            if (!authentication.isAuthenticated()) {
                String msg = messageSource.getMessage("login.error", null, locale);
                return ResponseEntity.badRequest().body(msg);
            }
            String accessToken = jwtService.generateToken(user.getUsername());
            String refreshToken = jwtService.generateRefreshToken(user.getUsername());
            AuthResponse authRes = new AuthResponse(accessToken, refreshToken);
            return ResponseEntity.ok(authRes);
        } catch (Exception e) {
            String msg = messageSource.getMessage("login.error", null, locale);
            return ResponseEntity.badRequest().body(msg);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) throws InvalidCredentialsException {
        String refreshToken = request.getRefreshToken();

        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new InvalidCredentialsException("Refresh token is empty.");
        }

        return ResponseEntity.ok(authService.refreshTokens(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());

        return ResponseEntity.noContent().build();
    }
}
