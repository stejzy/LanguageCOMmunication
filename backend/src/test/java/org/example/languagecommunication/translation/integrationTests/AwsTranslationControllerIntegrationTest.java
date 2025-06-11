package org.example.languagecommunication.translation.integrationTests;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.auth.service.JwtService;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.example.languagecommunication.translation.awstranslation.repository.TranslationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
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

        Translation t1 = Translation.builder()
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .success(true)
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();

        Translation t2 = Translation.builder()
                .sourceText("Goodbye")
                .translatedText("Do widzenia")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .success(true)
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();

        Translation t3 = Translation.builder()
                .sourceText("Error")
                .translatedText(null)
                .sourceLanguage("en")
                .targetLanguage("skibidi")
                .success(false)
                .errorMessage("Error")
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();

        translationRepository.saveAll(List.of(t1, t2, t3));
    }

    @Test
    public void translateText_shouldReturnTranslationDTO() throws Exception{
        String text = "Hello";
        String sourceLang = "en";
        String targetLang = "pl";

        mockMvc.perform(get("/translate")
                        .param("text", text)
                        .param("sourceLang", sourceLang)
                        .param("targetLang", targetLang)
                        .header("Authorization", "Bearer " + jwt)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.translatedText").isNotEmpty())
                .andExpect(jsonPath("$.sourceLanguage").value("en"))
                .andExpect(jsonPath("$.targetLanguage").value("pl"));
    }

    @Test
    public void detectLanguage_shouldReturnDetectedLanguage() throws Exception {
        String text = "Hello, my friend.";

        mockMvc.perform(get("/detectLanguage")
                    .param("text", text)
                    .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.languageCode").value("en"));

    }

    @Test
    public void getSupportedLanguages_shouldReturnListOfLanguageDTO() throws Exception{
        mockMvc.perform(get("/supportedLanguages")
                        .header("Authorization", "Bearer " + jwt)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(73))
                .andExpect(jsonPath("$[0].languageCode").exists())
                .andExpect(jsonPath("$[0].languageName").exists());
    }

    @Test
    public void getAllTranslations_shouldReturnAllTranslations() throws Exception {
        mockMvc.perform(get("/translations/all")
                        .header("Authorization", "Bearer " + jwt)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].sourceText").value("Hello"));
    }

    @Test
    public void getSuccessfulTranslations_shouldReturnOnlySuccessfulTranslations() throws Exception {
        mockMvc.perform(get("/translations/successful")
                        .header("Authorization", "Bearer " + jwt)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].sourceText").value("Hello"))
                .andExpect(jsonPath("$[0].success").value(true))
                .andExpect(jsonPath("$[1].sourceText").value("Goodbye"))
                .andExpect(jsonPath("$[1].success").value(true));
    }

    @Test
    public void deleteTranslation_shouldDeleteTranslationAndReturnNoContent() throws Exception {
        Translation translation = translationRepository.findAll().getFirst();
        Long idToDelete = translation.getId();

        assertEquals(3, translationRepository.findAll().size());


        mockMvc.perform(delete("/translations/delete/{id}", idToDelete)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNoContent());

        boolean exists = translationRepository.existsById(idToDelete);
        assertFalse(exists, "Translation should be deleted");
        assertEquals(2, translationRepository.findAll().size());
    }

}
