package org.example.languagecommunication.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.auth.dto.RegisterDTO;
import org.example.languagecommunication.auth.dto.UserDTO;
import org.example.languagecommunication.auth.dto.VerificationRequest;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class SecurityTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private JavaMailSender javaMailSender;


    @Test
    @DisplayName("/api/auth/register is public")
    void register_isPublic() throws Exception {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("testuser");
        registerDTO.setEmail("testuser@testuser.com");
        registerDTO.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/api/secure/test is protected - no JWT")
    void secureEndpoint_requiresAuth() throws Exception {
        mockMvc.perform(get("/api/secure/test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/api/secure/test is protected - with valid JWT")
    void secureEndpoint_withValidJwt() throws Exception {
        User user = new User();
        user.setUsername("secureuser");
        user.setEmail("secureuser@email.com");
        user.setPassword("$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        user.setEnabled(true);
        user.setAuthProvider("local");
        userRepository.save(user);

        String validJwt = TestJwtUtil.generateValidJwt("secureuser");
        mockMvc.perform(get("/api/secure/test")
                .header("Authorization", "Bearer " + validJwt))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Login endpoint should be resistant to SQL Injection")
    void login_shouldResistSqlInjection() throws Exception {
        // Register and verify user
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("sqluser");
        registerDTO.setEmail("sqluser@email.com");
        registerDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());
        User user = userRepository.findByEmail("sqluser@email.com").get();
        VerificationRequest verifyReq = new VerificationRequest();
        verifyReq.setEmail("sqluser@email.com");
        verifyReq.setCode(user.getVerificationCode());
        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk());

        // Attempt SQL Injection in password
        UserDTO loginDTO = new UserDTO();
        loginDTO.setUsername("sqluser'; DROP TABLE users;");
        loginDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest());

        assertThat(userRepository.findByUsername("' OR '1'='1")).isEmpty();
    }

    @Test
    @DisplayName("Register endpoint should be resistant to XSS in username")
    void register_shouldResistXssInUsername() throws Exception {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("<script>alert('xss')</script>");
        registerDTO.setEmail("xss@email.com");
        registerDTO.setPassword("Password1!");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isBadRequest());
    }
}