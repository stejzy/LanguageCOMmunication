package org.example.languagecommunication.auth.service;

import io.micrometer.common.util.StringUtils;
import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.exceptions.*;
import org.example.languagecommunication.auth.model.RefreshTokenEntity;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.RefreshTokenRepository;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.common.utils.Hasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AuthService implements IAuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenRepository tokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    public AuthService(UserRepository userRepository, EmailService emailService, RefreshTokenRepository repository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.tokenRepository = repository;
        this.jwtService = jwtService;
    }

    @Override
    public User register(User user) {
        Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            if (existingUser.isEnabled()) {
                throw new EmailAlreadyExistsException("Email " + user.getEmail() + " is already registered.");
            }

            validateUser(user);

            String verificationCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6);
            existingUser.setVerificationCode(verificationCode);
            existingUser.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

            existingUser.setUsername(user.getUsername());
            existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            try {
                emailService.sendVerificationEmail(existingUser.getEmail(), verificationCode);
            } catch (MailSendException err) {
                throw new MailSendFailedException("Mail server connection failed. Couldn't connect to host.");
            }

            return userRepository.save(existingUser);
        }

        validateUser(user);

        String verificationCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        user.setEnabled(false);

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
        } catch (MailSendException err) {
            throw new MailSendFailedException("Mail server connection failed. Couldn't connect to host.");
        }

        return userRepository.save(user);
    }

    private void validateUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new EmailAlreadyExistsException("Username " + user.getUsername() + " is already taken.");
        }

        if (!isValidPassword(user.getPassword())) {
            throw new IncorrectPasswordException("Password must be at least 8 characters long, " +
                    "contain at least one letter, one digit, and one special character.");
        }
    }

    @Override
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

    @Override
    public AuthResponse refreshTokens(String refreshToken) {
        if (refreshToken == null) {
            throw new BadCredentialsException("Empty refresh token");
        }

        String hashed = Hasher.hash(refreshToken);
        RefreshTokenEntity entity = tokenRepository
                .findByTokenHash(hashed)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token."));

        if (entity.getExpiryDate().isBefore(Instant.now())) {
            tokenRepository.delete(entity);
            throw new CredentialsExpiredException("Refresh token is expired.");
        }

        tokenRepository.delete(entity);

        String user = entity.getUsername();
        String newAccess  = jwtService.generateToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        return new AuthResponse(newAccess, newRefresh);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null) {
            return;
        }

        String hashed = Hasher.hash(refreshToken);

        tokenRepository.findByTokenHash(hashed)
                .ifPresent(tokenRepository::delete);
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

    public String getVerificationCodeForEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getVerificationCode)
                .orElse(null);
    }
}
