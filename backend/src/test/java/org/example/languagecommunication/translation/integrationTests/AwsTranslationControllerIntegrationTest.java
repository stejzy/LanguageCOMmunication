package org.example.languagecommunication.translation.integrationTests;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.translation.awstranslation.repository.TranslationRepository;
import org.example.languagecommunication.translation.awstranslation.service.TranslationHistoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
public class AwsTranslationControllerIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    private TranslationRepository translationRepository;

    @MockitoBean
    private org.springframework.mail.javamail.JavaMailSender javaMailSender;

    //Potrzebne do generowania tokenu
    @Autowired
    private UserRepository userRepository;

    private String testUsername;
    private Long testUserId;
    private String jwt;

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
        jwt = TestJwtUtil.generateValidJwt(testUsername);
    }

//    @Test
//    public void translateText_shouldReturnTranslationDTO() throws Exception{
//        String text = "Hello";
//        String sourceLang = "en";
//        String targetLang = "pl";
//
//        mockMvc.perform(get("/translate")
//                        .param("text", text)
//                        .param("sourceLang", sourceLang)
//                        .param("targetLang", targetLang)
//                        .accept(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
//                .andExpect(jsonPath("$.translatedText").isNotEmpty())
//                .andExpect(jsonPath("$.sourceLanguage").value("en"))
//                .andExpect(jsonPath("$.targetLanguage").value("pl"));
//    }
//
//    @Test
//    public void detectLanguage_shouldReturnDetectedLanguage() throws Exception {
//        String text = "Hello, my friend.";
//
//        mockMvc.perform(get("/detectLanguage")
//                .param("text", text))
//                .andExpect(status().isOk())
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
//                .andExpect(jsonPath("$.languageCode").value("en"));
//
//    }



}
