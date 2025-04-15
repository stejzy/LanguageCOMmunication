package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.exceptions.*;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email " + user.getEmail() + " is already registered.");
        }

        String verificationCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        user.setEnabled(false);

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return savedUser;
    }

    public void verifyUser(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new UserAlreadyVerifiedException("User already verified");
        }

        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new VerificationCodeExpiredException("Verification code expired");
        }

        if (!code.equals(user.getVerificationCode())) {
            throw new InvalidVerificationCodeException("Invalid verification code");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);
    }
}
