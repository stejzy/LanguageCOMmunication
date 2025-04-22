package org.example.languagecommunication.auth.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.apache.http.auth.InvalidCredentialsException;
import org.example.languagecommunication.auth.dto.*;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.service.AuthService;
import org.example.languagecommunication.auth.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    @Value("${app.jwt.refresh-expiration-time}")
    private Long refreshExpirationTime;

    @Autowired
    public AuthController(AuthService authService, AuthenticationManager authManager, JwtService jwtService) {
        this.authService = authService;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterDTO registerDTO) {
        User user = new User(registerDTO.getUsername(), registerDTO.getEmail(), registerDTO.getPassword());
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestBody VerificationRequest request) {
        authService.verifyUser(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Verification successful!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UserDTO user, HttpServletResponse response) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        user.getPassword()
                )
        );

        if (!authentication.isAuthenticated()) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .sameSite("Strict")
                //.secure(true)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofMillis(refreshExpirationTime))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        AuthResponse authRes = new AuthResponse(accessToken);
        return ResponseEntity.ok(authRes);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken, HttpServletResponse response) throws InvalidCredentialsException {
        if (refreshToken == null) {
            throw new InvalidCredentialsException("Refresh token is empty.");
        }

        TokenPair pair = authService.refreshTokens(refreshToken);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", pair.getRefreshToken())
                .httpOnly(true)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofMillis(refreshExpirationTime))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new AuthResponse(pair.getAccessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        authService.logout(refreshToken);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/api/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.noContent().build();
    }
}
