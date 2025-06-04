package org.example.languagecommunication.flashcard.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class FlashcardSecurityTest {
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
        User user = new User(testUsername, testEmail, "$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        user.setEnabled(true);
        user.setAuthProvider("local");
        user = userRepository.save(user);
        testUserId = user.getId();
        jwt = TestJwtUtil.generateValidJwt(testUsername);
    }

    @Test
    @DisplayName("Creating flashcard with XSS in frontContent is rejected")
    void createFlashcardWithXssInFrontContent() throws Exception {
        Flashcard flashcard = new Flashcard("<script>alert('xss')</script>", "Back");
        flashcard.setUserID(testUserId);
        mockMvc.perform(post("/api/flashcards")
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Editing flashcard with XSS in frontContent is rejected")
    void editFlashcardWithXssInFrontContent() throws Exception {
        Flashcard flashcard = new Flashcard("Front", "Back");
        flashcard.setUserID(testUserId);
        flashcard = flashcardRepository.save(flashcard);
        Long cardId = flashcard.getId();
        Flashcard update = new Flashcard("<script>alert('xss')</script>", "Back");
        update.setUserID(testUserId);
        mockMvc.perform(put("/api/flashcards/" + cardId)
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Editing flashcard with SQL injection in frontContent is rejected")
    void editFlashcardWithSqlInjectionInFrontContent() throws Exception {
        Flashcard flashcard = new Flashcard("Front", "Back");
        flashcard.setUserID(testUserId);
        flashcard = flashcardRepository.save(flashcard);
        Long cardId = flashcard.getId();
        Flashcard update = new Flashcard("test'; DROP TABLE flashcard; --", "Back");
        update.setUserID(testUserId);
        mockMvc.perform(put("/api/flashcards/" + cardId)
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        assertThat(flashcardRepository.findById(flashcard.getId())).isPresent();
    }

    @Test
    @DisplayName("Only owner can access their flashcard (403 for others)")
    void onlyOwnerCanAccessFlashcard() throws Exception {
        // Create flashcard for test user
        Flashcard flashcard = new Flashcard("Front", "Back");
        flashcard.setUserID(testUserId);
        flashcard = flashcardRepository.save(flashcard);
        Long cardId = flashcard.getId();

        // Create another user and JWT
        String otherUnique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String otherUsername = "oth" + otherUnique;
        String otherEmail = otherUsername + "@e.com";
        User otherUser = new User(otherUsername, otherEmail, "$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        otherUser.setEnabled(true);
        otherUser.setAuthProvider("local");
        userRepository.save(otherUser);
        String otherJwt = TestJwtUtil.generateValidJwt(otherUsername);

        // Try to access flashcard as other user
        mockMvc.perform(get("/api/flashcards/" + cardId)
                .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authentication is required to access flashcards (401 if no JWT)")
    void getFlashcards_requiresAuth() throws Exception {
        mockMvc.perform(get("/api/flashcards/user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Creating flashcard with XSS in backContent is rejected")
    void createFlashcardWithXssInBackContent() throws Exception {
        Flashcard flashcard = new Flashcard("Front", "<script>alert('xss')</script>");
        flashcard.setUserID(testUserId);
        mockMvc.perform(post("/api/flashcards")
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Editing flashcard with XSS in backContent is rejected")
    void editFlashcardWithXssInBackContent() throws Exception {
        Flashcard flashcard = new Flashcard("Front", "Back");
        flashcard.setUserID(testUserId);
        flashcard = flashcardRepository.save(flashcard);
        Long cardId = flashcard.getId();
        Flashcard update = new Flashcard("Front", "<script>alert('xss')</script>");
        update.setUserID(testUserId);
        mockMvc.perform(put("/api/flashcards/" + cardId)
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SQL injection in create is stored as text and does not affect DB")
    void createFlashcardWithSqlInjectionDoesNotAffectDb() throws Exception {
        // Add two safe flashcards before the test
        Flashcard card1 = new Flashcard("Safe1", "SafeBack1");
        card1.setUserID(testUserId);
        card1 = flashcardRepository.save(card1);

        Flashcard card2 = new Flashcard("Safe2", "SafeBack2");
        card2.setUserID(testUserId);
        card2 = flashcardRepository.save(card2);

        // Add flashcard with SQL injection
        String sqlPayload = "test'; DROP TABLE flashcard; --";
        Flashcard flashcard = new Flashcard(sqlPayload, sqlPayload);
        flashcard.setUserID(testUserId);
        String response = mockMvc.perform(post("/api/flashcards")
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Flashcard created = objectMapper.readValue(response, Flashcard.class);

        // Check that all flashcards still exist
        assertThat(flashcardRepository.findById(card1.getId())).isPresent();
        assertThat(flashcardRepository.findById(card2.getId())).isPresent();
        assertThat(flashcardRepository.findById(created.getId())).isPresent();
        // Check that the payload is stored as text
        assertThat(created.getFrontContent()).isEqualTo(sqlPayload);
    }
} 