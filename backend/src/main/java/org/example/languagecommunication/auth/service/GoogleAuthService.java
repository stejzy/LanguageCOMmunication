package org.example.languagecommunication.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.exceptions.InvalidTokenException;
import org.example.languagecommunication.auth.exceptions.UserAlreadyExistsException;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleAuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final GoogleIdTokenVerifier verifier;

    @Autowired
    public GoogleAuthService(JwtService jwtService, UserRepository userRepository, GoogleIdTokenVerifier verifier) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.verifier = verifier;
    }

    public AuthResponse authenticate(String idTokenString) {
        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException  | IOException e) {
            throw new InvalidTokenException("Error while validating token.", e);
        }

        if (idToken == null) {
            throw new InvalidTokenException("Invalid or expired token.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            if ("google".equalsIgnoreCase(existingUser.getAuthProvider())) {
                String jwt = jwtService.generateToken(email);
                String refreshJwt = jwtService.generateRefreshToken(email);
                return new AuthResponse(jwt, refreshJwt);
            } else {
                throw new UserAlreadyExistsException("There is already user with email " + email + ".");
            }
        } else {
            User newUser = new User();

            newUser.setUsername(email);
            newUser.setEmail(email);
            newUser.setPassword(UUID.randomUUID().toString());
            newUser.setAuthProvider("google");
            newUser.setEnabled(true);

            userRepository.save(newUser);

            String jwt = jwtService.generateToken(email);
            String refreshJwt = jwtService.generateRefreshToken(email);
            return new AuthResponse(jwt, refreshJwt);
        }
    }
}
