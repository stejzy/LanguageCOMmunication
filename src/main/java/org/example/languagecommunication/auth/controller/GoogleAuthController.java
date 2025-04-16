package org.example.languagecommunication.auth.controller;

import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.dto.GoogleLoginRequest;
import org.example.languagecommunication.auth.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {
    private final GoogleAuthService googleAuthService;

    @Autowired
    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<Object> googleLogin(@RequestBody GoogleLoginRequest request) {
        AuthResponse response = googleAuthService.authenticate(request.getIdToken());
        return ResponseEntity.ok(response);
    }
}
