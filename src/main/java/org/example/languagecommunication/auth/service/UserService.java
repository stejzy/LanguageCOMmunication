package org.example.languagecommunication.auth.service;

import io.micrometer.common.util.StringUtils;
import org.example.languagecommunication.auth.dto.RegisterDTO;
import org.example.languagecommunication.auth.dto.UserDTO;
import org.example.languagecommunication.auth.exceptions.*;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    public UserService(UserRepository userRepository, EmailService emailService, AuthenticationManager authManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    public User register(RegisterDTO registerDTO) {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email " + registerDTO.getEmail() + " is already registered.");
        }

        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new EmailAlreadyExistsException("Username " + registerDTO.getUsername() + " is already taken.");
        }

        if (!isValidPassword(registerDTO.getPassword())) {
            throw new IncorrectPasswordException("Password must be at least 8 characters long, " +
                    "contain at least one letter, one digit, and one special character.");
        }

        String verificationCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        User user = new User(registerDTO.getUsername(), registerDTO.getEmail(), registerDTO.getPassword());
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

    public String login(UserDTO user) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if(authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUsername());
        }

        return "Fail";
    }

    private boolean isValidPassword(String password) {
        if (StringUtils.isBlank(password) || password.length() < 8) {
            return false;
        }

        String regex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>/?]).{8,}$";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(password);

        return matcher.matches();
    }
}
