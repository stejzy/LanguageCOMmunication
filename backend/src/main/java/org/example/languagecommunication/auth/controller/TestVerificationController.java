package org.example.languagecommunication.auth.controller;

import org.example.languagecommunication.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@Profile("test")
public class TestVerificationController {
    private final AuthService authService;

    @Autowired
    public TestVerificationController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/last-verification-code")
    public VerificationCodeResponse getLastVerificationCode(@RequestParam String email) {
        String code = authService.getVerificationCodeForEmail(email);
        return new VerificationCodeResponse(code);
    }

    public static class VerificationCodeResponse {
        public String code;
        public VerificationCodeResponse(String code) { this.code = code; }
    }
} 