package org.example.languagecommunication.flashcard.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.transaction.annotation.Transactional;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class FlashcardIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private FlashcardRepository flashcardRepository;
    @Autowired
    private UserRepository userRepository;
    @MockitoBean
    private JavaMailSender javaMailSender;

    private String jwt;
    private Long testUserId;
    private String testUsername;

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

    @Test
    @DisplayName("Add, get, edit, review, and delete flashcard flow")
    void fullFlashcardFlow() throws Exception {
        // Add flashcard
        Flashcard flashcard = new Flashcard("Front integration", "Back integration");
        flashcard.setUserID(testUserId);

        String addResponse = mockMvc.perform(post("/api/flashcards")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwt)
                .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.frontContent").value("Front integration"))
                .andReturn().getResponse().getContentAsString();
        Flashcard created = objectMapper.readValue(addResponse, Flashcard.class);
        Long cardId = created.getId();

        // Get user's flashcards
        String getResponse = mockMvc.perform(get("/api/flashcards/user")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<?> cards = objectMapper.readValue(getResponse, List.class);
        assertThat(cards).isNotEmpty();

        // Edit flashcard status
        mockMvc.perform(patch("/api/flashcards/" + cardId + "/status?status=LEARNED")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LEARNED"));

        // Review flashcard (correct)
        mockMvc.perform(post("/api/flashcards/" + cardId + "/review?correct=true")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctResponses").value(1));

        // Delete flashcard
        mockMvc.perform(delete("/api/flashcards/" + cardId)
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNoContent());

        assertThat(flashcardRepository.findById(cardId)).isEmpty();
    }

    @Test
    @DisplayName("Get non-existent flashcard returns 404")
    void getNonExistentFlashcard() throws Exception {
        mockMvc.perform(get("/api/flashcards/999999")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNotFound());
    }
} 