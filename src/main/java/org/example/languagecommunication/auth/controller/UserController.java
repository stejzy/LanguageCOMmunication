package org.example.languagecommunication.auth.controller;

import jakarta.validation.Valid;
import org.example.languagecommunication.auth.dto.RegisterDTO;
import org.example.languagecommunication.auth.dto.UserDTO;
import org.example.languagecommunication.auth.dto.VerificationRequest;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final AuthService authService;

    @Autowired
    public UserController(AuthService authService) {
        this.authService = authService;
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
    public ResponseEntity<String> login(@RequestBody UserDTO user) {
        return ResponseEntity.ok(authService.login(user));
    }
}
