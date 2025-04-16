package org.example.languagecommunication.auth.service;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.exceptions.InvalidTokenException;
import org.example.languagecommunication.auth.exceptions.UserAlreadyExistsException;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.security.GeneralSecurityException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


class GoogleAuthServiceTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    @Mock
    private GoogleIdToken googleIdToken;

    @InjectMocks
    private GoogleAuthService googleAuthService;

    private final String validIdToken = "validIdToken";
    private final String invalidIdToken = "invalidIdToken";
    private final String email = "testuser@gmail.com";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAuthenticate_WhenUserDoesNotExist_ShouldCreateNewUserAndReturnJwt() throws Exception {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn(email);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(googleIdTokenVerifier.verify(validIdToken)).thenReturn(googleIdToken);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(jwtService.generateToken(email)).thenReturn("generatedJwt");

        AuthResponse authResponse = googleAuthService.authenticate(validIdToken);

        verify(userRepository).save(any(User.class));
        assertNotNull(authResponse);
        assertEquals("generatedJwt", authResponse.getJwt());
    }

    @Test
    public void testAuthenticate_WhenUserExistsWithDifferentAuthProvider_ShouldThrowUserAlreadyExistsException() throws Exception {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn(email);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(googleIdTokenVerifier.verify(validIdToken)).thenReturn(googleIdToken);

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setAuthProvider("email");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> googleAuthService.authenticate(validIdToken));
        assertEquals("There is already user with email " + email + ".", exception.getMessage());
    }

    @Test
    public void testAuthenticate_WhenUserExistsWithGoogleAuth_ShouldReturnJwt() throws Exception {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn(email);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(googleIdTokenVerifier.verify(validIdToken)).thenReturn(googleIdToken);

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setAuthProvider("google");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(jwtService.generateToken(email)).thenReturn("generatedJwt");

        AuthResponse authResponse = googleAuthService.authenticate(validIdToken);

        verify(userRepository, times(0)).save(any(User.class));
        assertNotNull(authResponse);
        assertEquals("generatedJwt", authResponse.getJwt());
    }

    @Test
    public void testAuthenticate_WhenTokenIsInvalid_ShouldThrowInvalidTokenException() throws Exception {
        when(googleIdTokenVerifier.verify(invalidIdToken)).thenThrow(new GeneralSecurityException());

        InvalidTokenException exception = assertThrows(InvalidTokenException.class, () -> googleAuthService.authenticate(invalidIdToken));
        assertEquals("Error while validating token.", exception.getMessage());
    }

    @Test
    public void testAuthenticate_WhenTokenIsExpired_ShouldThrowInvalidTokenException() throws Exception {
        when(googleIdTokenVerifier.verify(validIdToken)).thenReturn(null);

        InvalidTokenException exception = assertThrows(InvalidTokenException.class, () -> googleAuthService.authenticate(validIdToken));
        assertEquals("Invalid or expired token.", exception.getMessage());
    }
}