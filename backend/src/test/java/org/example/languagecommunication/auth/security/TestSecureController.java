package org.example.languagecommunication.auth.security;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure")
public class TestSecureController {
    @GetMapping("/test")
    public String test() {
        return "secure ok";
    }
} 