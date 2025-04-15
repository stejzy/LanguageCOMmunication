package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


class UserCleanupServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserCleanupService userCleanupService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deleteExpiredUnverifiedUsers_whenExpiredUsersExist_thenDeleteAllCalled() {
        User user1 = new User("user1", "user1@example.com", "password1");
        User user2 = new User("user2", "user2@example.com", "password2");

        List<User> expiredUsers = Arrays.asList(user1, user2);
        when(userRepository.findByVerificationCodeExpiresAtBeforeAndEnabledFalse(any(LocalDateTime.class)))
                .thenReturn(expiredUsers);

        userCleanupService.deleteExpiredUnverifiedUsers();

        verify(userRepository).findByVerificationCodeExpiresAtBeforeAndEnabledFalse(any(LocalDateTime.class));
        verify(userRepository).deleteAll(expiredUsers);
    }

    @Test
    void deleteExpiredUnverifiedUsers_whenNoExpiredUsers_thenDeleteAllNotCalled() {
        when(userRepository.findByVerificationCodeExpiresAtBeforeAndEnabledFalse(any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        userCleanupService.deleteExpiredUnverifiedUsers();

        verify(userRepository).findByVerificationCodeExpiresAtBeforeAndEnabledFalse(any(LocalDateTime.class));
        verify(userRepository, never()).deleteAll(anyList());
    }
}