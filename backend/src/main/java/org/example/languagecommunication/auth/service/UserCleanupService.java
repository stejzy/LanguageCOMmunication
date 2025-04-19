package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserCleanupService {
    private final UserRepository userRepository;

    @Autowired
    public UserCleanupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 */10 * * * ?")
    public void deleteExpiredUnverifiedUsers() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(10);
        List<User> expiredUsers = userRepository.findByVerificationCodeExpiresAtBeforeAndEnabledFalse(expirationThreshold);

        if (!expiredUsers.isEmpty()) {
            userRepository.deleteAll(expiredUsers);
        }
    }
}
