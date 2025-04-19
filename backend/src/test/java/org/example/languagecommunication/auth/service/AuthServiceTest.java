package org.example.languagecommunication.auth.service;

import org.example.languagecommunication.auth.exceptions.EmailAlreadyExistsException;
import org.example.languagecommunication.auth.exceptions.InvalidVerificationCodeException;
import org.example.languagecommunication.auth.exceptions.UserAlreadyVerifiedException;
import org.example.languagecommunication.auth.exceptions.VerificationCodeExpiredException;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ShouldSaveUserAndSendEmail() {
        User user = new User("testuser", "test@example.com", "password123!");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registeredUser = authService.register(user);

        verify(userRepository).save(userCaptor.capture());
        verify(emailService).sendVerificationEmail(eq("test@example.com"), anyString());

        User captured = userCaptor.getValue();

        assertEquals("testuser", captured.getUsername());
        assertFalse(captured.isEnabled());
        assertNotNull(captured.getVerificationCode());
        assertTrue(captured.getVerificationCodeExpiresAt().isAfter(LocalDateTime.now()));
        assertNotEquals("password", captured.getPassword());
    }

    @Test
    void register_ShouldThrowWhenEmailExists() {
        User user = new User("testuser", "test@example.com", "password");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    void verifyUser_ShouldEnableUser() {
        User user = new User("testuser", "test@example.com", "password");
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(5));
        user.setEnabled(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        authService.verifyUser("test@example.com", "123456");

        assertTrue(user.isEnabled());
        assertNull(user.getVerificationCode());
        assertNull(user.getVerificationCodeExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyUser_ShouldThrow_WhenCodeExpired() {
        User user = new User("testuser", "test@example.com", "password");
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().minusMinutes(1));
        user.setEnabled(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(VerificationCodeExpiredException.class, () -> authService.verifyUser("test@example.com", "123456"));
    }

    @Test
    void verifyUser_ShouldThrow_WhenCodeInvalid() {
        User user = new User("testuser", "test@example.com", "password");
        user.setVerificationCode("654321");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(5));
        user.setEnabled(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(InvalidVerificationCodeException.class, () -> authService.verifyUser("test@example.com", "123456"));
    }

    @Test
    void verifyUser_ShouldThrow_WhenUserAlreadyVerified() {
        User user = new User("testuser", "test@example.com", "password");
        user.setEnabled(true);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(UserAlreadyVerifiedException.class, () -> authService.verifyUser("test@example.com", "any"));
    }
}