package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.dto.UserDTO;
import org.example.languagecommunication.auth.model.User;

public interface IAuthService {
    User register(User user);

    void verifyUser(String email, String code);

    String login(UserDTO user);
}
