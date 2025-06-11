package org.example.languagecommunication.translation.securityTests;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.support.MethodArgumentTypeMismatchException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
public class AwsTranslationControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private org.springframework.mail.javamail.JavaMailSender javaMailSender;

    //Potrzebne do generowania tokenu
    @Autowired
    private UserRepository userRepository;

    private String testUsername;
    private Long testUserId;
    private String validJwt;

    @BeforeEach
    void setUpUserAndJwt() {
        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        testUsername = "tst" + unique;
        String testEmail = testUsername + "@e.com";
        userRepository.findByUsername(testUsername).ifPresent(userRepository::delete);
        User user = new User(testUsername, testEmail, "$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        user.setEnabled(true);
        user.setAuthProvider("local");
        user = userRepository.save(user);
        testUserId = user.getId();
        validJwt = TestJwtUtil.generateValidJwt(testUsername);
    }

    // --- TESTY BEZ TOKENA JWT ---

    @Test
    public void accessTranslate_withoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translate")
                        .param("text", "Hello")
                        .param("sourceLang", "en")
                        .param("targetLang", "pl"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessDetectLanguage_withoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/detectLanguage")
                        .param("text", "Hello"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessGetAllTranslations_withoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translations/all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessGetSuccessfulTranslations_withoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translations/successful"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void deleteTranslation_withoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/translations/delete/1"))
                .andExpect(status().isUnauthorized());
    }

    // --- TESTY Z BŁĘDNYM TOKENEM ---

    @Test
    public void accessTranslate_withInvalidToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translate")
                        .param("text", "Hello")
                        .param("sourceLang", "en")
                        .param("targetLang", "pl")
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessDetectLanguage_withInvalidToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/detectLanguage")
                        .param("text", "Hello")
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessGetAllTranslations_withInvalidToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translations/all")
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void accessGetSuccessfulTranslations_withInvalidToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/translations/successful")
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void deleteTranslation_withInvalidToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/translations/delete/1")
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }


    // --- DODATKOWE TESTY WALIDACJI PARAMETRÓW (np. SQL Injection) ---

    @Test
    public void translateText_withSqlInjectionAttempt_shouldNotCauseError() throws Exception {
        String maliciousInput = "' OR 1=1 --";

        mockMvc.perform(get("/translate")
                        .param("text", maliciousInput)
                        .param("sourceLang", "en")
                        .param("targetLang", "pl")
                        .header("Authorization","Bearer " + validJwt))
                .andExpect(status().isOk());
    }

    @Test
    public void detectLanguage_withSqlInjectionAttempt_shouldNotCauseError() throws Exception {
        String maliciousInput = "' OR '1'='1";

        mockMvc.perform(get("/detectLanguage")
                        .param("text", maliciousInput)
                        .header("Authorization", "Bearer " + validJwt))
                .andExpect(status().isOk());
    }

    @Test
    public void getAllTranslations_withSqlInjectionInHeader_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/translations/all")
                        .header("X-Custom-Header", "' OR 1=1 --")
                        .header("Authorization", "Bearer " + validJwt))
                .andExpect(status().isOk());
    }

    @Test
    public void getSuccessfulTranslations_withSqlInjectionInHeader_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/translations/successful")
                        .header("X-Custom-Header", "' OR 1=1 --")
                        .header("Authorization", "Bearer " + validJwt))
                .andExpect(status().isOk());
    }

}
