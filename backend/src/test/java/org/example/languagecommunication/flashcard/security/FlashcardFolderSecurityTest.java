package org.example.languagecommunication.flashcard.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.flashcard.dto.FlashcardFolderRequest;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.repositories.FlashcardFolderRepository;
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

import java.util.Collections;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class FlashcardFolderSecurityTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private FlashcardFolderRepository folderRepository;
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
    @DisplayName("/api/flashcard-folders/user is protected - no JWT")
    void getFolders_requiresAuth() throws Exception {
        mockMvc.perform(get("/api/flashcard-folders/user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("SQL injection in folder name is rejected and does not affect DB")
    void sqlInjectionInFolderName() throws Exception {
        FlashcardFolder folder = new FlashcardFolder(Collections.emptyList(), "NormalName");
        folder.setUserID(testUserId);
        folder = folderRepository.save(folder);
        UUID folderId = folder.getId();
        mockMvc.perform(put("/api/flashcard-folders/" + folderId)
                .header("Authorization", "Bearer " + jwt)
                .param("name", "test'; DROP TABLE flashcard_folder; --"))
                .andExpect(status().isOk());
        // Check that the folder still exists
        assertThat(folderRepository.findById(folderId)).isPresent();
    }

    @Test
    @DisplayName("XSS in folder name is rejected")
    void xssInFolderName() throws Exception {
        FlashcardFolder folder = new FlashcardFolder(Collections.emptyList(), "NormalName");
        folder.setUserID(testUserId);
        folder = folderRepository.save(folder);
        UUID folderId = folder.getId();
        mockMvc.perform(put("/api/flashcard-folders/" + folderId)
                .header("Authorization", "Bearer " + jwt)
                .param("name", "<script>alert('xss')</script>"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Only owner can access their folder (403 for others)")
    void onlyOwnerCanAccessFolder() throws Exception {
        // Create folder for testuser
        FlashcardFolder folder = new FlashcardFolder(Collections.emptyList(), "OwnerFolder");
        folder.setUserID(testUserId);
        folder = folderRepository.save(folder);
        UUID folderId = folder.getId();

        // Create another user and JWT
        String otherUnique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String otherUsername = "oth" + otherUnique;
        String otherEmail = otherUsername + "@e.com";
        User otherUser = new User(otherUsername, otherEmail, "$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        otherUser.setEnabled(true);
        otherUser.setAuthProvider("local");
        otherUser = userRepository.save(otherUser);
        String otherJwt = TestJwtUtil.generateValidJwt(otherUsername);

        // Try to access folder as other user
        mockMvc.perform(get("/api/flashcard-folders/" + folderId)
                .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Creating folder with XSS in name is rejected")
    void createFolderWithXssInName() throws Exception {
        FlashcardFolderRequest request = new FlashcardFolderRequest();
        request.setName("<script>alert('xss')</script>");
        mockMvc.perform(post("/api/flashcard-folders")
                .header("Authorization", "Bearer " + jwt)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
} 