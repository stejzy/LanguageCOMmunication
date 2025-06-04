package org.example.languagecommunication.flashcard.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.auth.security.TestJwtUtil;
import org.example.languagecommunication.flashcard.dto.FlashcardRequest;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.repositories.FlashcardFolderRepository;
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

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class FlashcardFolderIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private FlashcardFolderRepository folderRepository;
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
    @DisplayName("Create, get, edit, add/remove flashcard, and delete folder flow")
    void fullFolderFlow() throws Exception {
        // Create folder
        FlashcardFolder folder = new FlashcardFolder(Collections.emptyList(), "Integration Folder");
        folder.setUserID(testUserId);
        String createResponse = mockMvc.perform(post("/api/flashcard-folders")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwt)
                .content(objectMapper.writeValueAsString(folder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Integration Folder"))
                .andReturn().getResponse().getContentAsString();
        FlashcardFolder created = objectMapper.readValue(createResponse, FlashcardFolder.class);
        UUID folderId = created.getId();

        // Get user's folders
        String getResponse = mockMvc.perform(get("/api/flashcard-folders/user")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<?> folders = objectMapper.readValue(getResponse, List.class);
        assertThat(folders).isNotEmpty();

        // Edit folder name
        mockMvc.perform(put("/api/flashcard-folders/" + folderId)
                .header("Authorization", "Bearer " + jwt)
                .param("name", "Edited Folder"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Edited Folder"));

        // Add flashcard to folder
        Flashcard flashcard = new Flashcard("Front", "Back");
        flashcard.setUserID(testUserId);
        flashcard = flashcardRepository.save(flashcard);
        FlashcardRequest addRequest = new FlashcardRequest();
        addRequest.setFlashcardIds(List.of(flashcard.getId()));
        mockMvc.perform(post("/api/flashcard-folders/" + folderId + "/flashcards")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwt)
                .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk());

        // Remove flashcard from folder
        FlashcardRequest removeRequest = new FlashcardRequest();
        removeRequest.setFlashcardIds(List.of(flashcard.getId()));
        mockMvc.perform(delete("/api/flashcard-folders/" + folderId + "/flashcards")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + jwt)
                .content(objectMapper.writeValueAsString(removeRequest)))
                .andExpect(status().isOk());

        // Delete folder
        mockMvc.perform(delete("/api/flashcard-folders/" + folderId)
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertThat(folderRepository.findById(folderId)).isEmpty();
    }

    @Test
    @DisplayName("Get non-existent folder returns 404")
    void getNonExistentFolder() throws Exception {
        mockMvc.perform(get("/api/flashcard-folders/" + UUID.randomUUID())
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Export folder to QR returns PNG image")
    void exportFolderToQr() throws Exception {
        // Create folder
        FlashcardFolder folder = new FlashcardFolder(Collections.emptyList(), "QR Export Folder");
        folder.setUserID(testUserId);
        folder = folderRepository.save(folder);
        UUID folderId = folder.getId();

        mockMvc.perform(get("/api/flashcard-folders/" + folderId + "/export-qr")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("folder_qr.png")))
                .andExpect(content().contentType(MediaType.IMAGE_PNG));
    }

    @Test
    @DisplayName("Import folder from QR (by id) creates a copy for user")
    void importFolderFromQr() throws Exception {
        // Create original folder with flashcards for another user
        String otherUnique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String otherUsername = "oth" + otherUnique;
        String otherEmail = otherUsername + "@e.com";
        User otherUser = new User(otherUsername, otherEmail, "$2a$12$abcdefghijklmnopqrstuvwxzy1234567890abcd");
        otherUser.setEnabled(true);
        otherUser.setAuthProvider("local");
        otherUser = userRepository.save(otherUser);
        Long otherUserId = otherUser.getId();

        Flashcard flashcard1 = new Flashcard("Front1", "Back1");
        flashcard1.setUserID(otherUserId);
        flashcard1 = flashcardRepository.save(flashcard1);
        Flashcard flashcard2 = new Flashcard("Front2", "Back2");
        flashcard2.setUserID(otherUserId);
        flashcard2 = flashcardRepository.save(flashcard2);

        FlashcardFolder originalFolder = new FlashcardFolder(List.of(flashcard1, flashcard2), "Original Folder");
        originalFolder.setUserID(otherUserId);
        originalFolder = folderRepository.save(originalFolder);
        UUID originalFolderId = originalFolder.getId();

        // Import folder as testuser
        String importResponse = mockMvc.perform(post("/api/flashcard-folders/" + originalFolderId + "/import")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Original Folder"))
                .andExpect(jsonPath("$.userID").value(testUserId.intValue()))
                .andExpect(jsonPath("$.flashcards").isArray())
                .andReturn().getResponse().getContentAsString();
        FlashcardFolder imported = objectMapper.readValue(importResponse, FlashcardFolder.class);
        assertThat(imported.getUserID()).isEqualTo(testUserId);
        assertThat(imported.getFlashcards()).hasSize(2);
        assertThat(imported.getName()).isEqualTo("Original Folder");
    }
} 