package org.example.languagecommunication.auth.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.auth.dto.AuthResponse;
import org.example.languagecommunication.auth.dto.RegisterDTO;
import org.example.languagecommunication.auth.dto.UserDTO;
import org.example.languagecommunication.auth.dto.VerificationRequest;
import org.example.languagecommunication.auth.dto.RefreshTokenRequest;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.RefreshTokenRepository;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.common.utils.Hasher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class AuthIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository tokenRepository;
    @MockitoBean
    private JavaMailSender javaMailSender;

    @Test
    @DisplayName("Register, verify, login, refresh, and logout flow")
    @Rollback
    void fullAuthFlow() throws Exception {
        // Register
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("testuser");
        registerDTO.setEmail("testuser@testuser.com");
        registerDTO.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());

        Optional<User> userOpt = userRepository.findByEmail("testuser@testuser.com");
        assertThat(userOpt).isPresent();
        User user = userOpt.get();
        assertThat(user.isEnabled()).isFalse();
        assertThat(user.getVerificationCode()).isNotNull();

        // Verify
        VerificationRequest verifyReq = new VerificationRequest();
        verifyReq.setEmail("testuser@testuser.com");
        verifyReq.setCode(user.getVerificationCode());

        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk());

        user = userRepository.findByEmail("testuser@testuser.com").get();
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.getVerificationCode()).isNull();

        // Login
        UserDTO loginDTO = new UserDTO();
        loginDTO.setUsername("testuser");
        loginDTO.setPassword("Password1!");

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn().getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(loginResponse, AuthResponse.class);

        // Refresh
        RefreshTokenRequest refreshReq = new RefreshTokenRequest();
        refreshReq.setRefreshToken(authResponse.getRefreshToken());
        String refreshResponse = mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn().getResponse().getContentAsString();
        AuthResponse refreshedAuth = objectMapper.readValue(refreshResponse, AuthResponse.class);

        // Logout
        RefreshTokenRequest logoutReq = new RefreshTokenRequest();
        logoutReq.setRefreshToken(refreshedAuth.getRefreshToken());
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(logoutReq)))
                .andExpect(status().isNoContent());

        // Assert that the refresh token is deleted from the repository
        String logoutTokenHash = Hasher.hash(refreshedAuth.getRefreshToken());
        assertThat(tokenRepository.findByTokenHash(logoutTokenHash)).isEmpty();
    }

    @Test
    @DisplayName("Register with duplicate email should fail")
    void register_duplicateEmail() throws Exception {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("integrationuser2");
        registerDTO.setEmail("integration2@email.com");
        registerDTO.setPassword("Password1!");

        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());

        // Second registration with same email
        RegisterDTO registerDTO2 = new RegisterDTO();
        registerDTO2.setUsername("integrationuser3");
        registerDTO2.setEmail("integration2@email.com");
        registerDTO2.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO2)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login with wrong password should fail")
    void login_wrongPassword_shouldFail() throws Exception {
        // Register and verify user
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("failuser");
        registerDTO.setEmail("failuser@email.com");
        registerDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());
        User user = userRepository.findByEmail("failuser@email.com").get();
        VerificationRequest verifyReq = new VerificationRequest();
        verifyReq.setEmail("failuser@email.com");
        verifyReq.setCode(user.getVerificationCode());
        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk());

        // Try to login with wrong password
        UserDTO loginDTO = new UserDTO();
        loginDTO.setUsername("failuser");
        loginDTO.setPassword("WrongPassword1!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Nieprawidłowa nazwa użytkownika lub hasło")));
    }

    @Test
    @DisplayName("Login without verifying user should fail")
    void login_withoutVerifying_shouldFail() throws Exception {
        // Register user (do not verify)
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("unverifieduser");
        registerDTO.setEmail("unverified@email.com");
        registerDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());

        // Try to login without verifying
        UserDTO loginDTO = new UserDTO();
        loginDTO.setUsername("unverifieduser");
        loginDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Nieprawidłowa nazwa użytkownika lub hasło")));
    }
} 