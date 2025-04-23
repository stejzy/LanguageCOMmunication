package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.model.User;

public interface IAuthService {
    User register(User user);

    void verifyUser(String email, String code);

    AuthResponse refreshTokens(String refreshToken);

    void logout(String refreshToken);
}
