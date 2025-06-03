package org.example.languagecommunication.translation.service;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.common.utils.SecurityUtils;
import org.example.languagecommunication.exception.TranslationException;
import org.example.languagecommunication.translation.awstranslation.DTO.TranslationDTO;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.example.languagecommunication.translation.awstranslation.repository.TranslationRepository;
import org.example.languagecommunication.translation.awstranslation.service.TranslationHistoryService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TranslationHistoryServiceTest {

    @Mock
    private TranslationRepository translationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TranslationHistoryService translationHistoryService;

    private User user;

    @BeforeEach
    public void setUp(){
        user = new User("test_user", "test@example.com", "password123");
        user.setEnabled(true);
        user.setId(1L);
    }

    @Test
    public void saveSuccess_shouldReturnTranslation(){

        try(MockedStatic<SecurityUtils> mockedStatic =  mockStatic(SecurityUtils.class)){
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            Translation expectedTranslation = Translation.builder()
                    .sourceText("Hello")
                    .translatedText("Cześć")
                    .sourceLanguage("en")
                    .targetLanguage("pl")
                    .timestamp(LocalDateTime.now())
                    .success(true)
                    .user(user)
                    .build();

            when(translationRepository.save(any(Translation.class))).thenReturn(expectedTranslation);

            Translation result = translationHistoryService.saveSuccess("Hello", "Cześć", "en", "pl");

            assertNotNull(result);
            assertEquals("Cześć", result.getTranslatedText());
            assertEquals(user, result.getUser());
        }
    }

    @Test
    public void saveError_shouldReturnTranslation() {

        try (MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            Translation expectedTranslation = Translation.builder()
                    .sourceText("Hello")
                    .translatedText("Cześć")
                    .sourceLanguage("en")
                    .targetLanguage("pl")
                    .timestamp(LocalDateTime.now())
                    .success(false)
                    .errorMessage("Some error occurred")
                    .user(user)
                    .build();

            when(translationRepository.save(any(Translation.class))).thenReturn(expectedTranslation);

            Translation result = translationHistoryService.saveError("Hello", "en", "pl", "Some error occurred");

            assertNotNull(result);
            assertEquals("Hello", result.getSourceText());
            assertEquals("Cześć", result.getTranslatedText());
            assertEquals("en", result.getSourceLanguage());
            assertEquals("pl", result.getTargetLanguage());
            assertFalse(result.isSuccess());
            assertEquals("Some error occurred", result.getErrorMessage());
            assertEquals(user, result.getUser());
        }
    }

    @Test
    public void getAllTranslations_shouldReturnListOfTranslationDTO(){
        List<Translation> translations = List.of(
                Translation.builder()
                        .id(10L)
                        .sourceText("Hello")
                        .translatedText("Cześć")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .build(),
                Translation.builder()
                        .id(11L)
                        .sourceText("Goodbye")
                        .translatedText("Do widzenia")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .build()
        );


        try(MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)){
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            when(translationRepository.findByUserId(1L)).thenReturn(translations);

            List<TranslationDTO> result = translationHistoryService.getAllTranslations();

            assertNotNull(result);
            assertEquals(2, result.size());

            TranslationDTO firstDto = result.getFirst();
            assertEquals(10L, firstDto.id());
            assertEquals("Hello", firstDto.sourceText());
            assertEquals("Cześć", firstDto.translatedText());
            assertEquals("en", firstDto.sourceLanguage());
            assertEquals("pl", firstDto.targetLanguage());
            assertTrue(firstDto.success());
            assertNull(firstDto.errorMessage());
        }
    }

    @Test
    public void getSuccessfulTranslations_shouldReturnListOfTranslationDTO() {
        List<Translation> successfulTranslations = List.of(
                Translation.builder()
                        .id(100L)
                        .sourceText("Hello")
                        .translatedText("Cześć")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .build(),
                Translation.builder()
                        .id(101L)
                        .sourceText("Thanks")
                        .translatedText("Dzięki")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .build()
        );

        try (MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
            when(translationRepository.findByUserIdAndSuccessTrue(1L)).thenReturn(successfulTranslations);

            List<TranslationDTO> result = translationHistoryService.getSuccessfulTranslations();


            //Tests
            assertNotNull(result);
            assertEquals(2, result.size());

            //Second elemnet of the list
            TranslationDTO first = result.get(1);
            assertEquals(101L, first.id());
            assertEquals("Thanks", first.sourceText());
            assertEquals("Dzięki", first.translatedText());
            assertTrue(first.success());
            assertNull(first.errorMessage());
        }
    }
    @Test
    public void deleteTranslationById_shouldDeleteWhenUserIsOwner(){
        Translation translation = Translation.builder()
                .id(100L)
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .success(true)
                .errorMessage(null)
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();

        when(translationRepository.findById(100L)).thenReturn(Optional.of(translation));

        try(MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)){
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

            translationHistoryService.deleteTranslationById(100L);

            verify(translationRepository).deleteById(100L);
        }
    }

    @Test
    public void deleteTranslationById_shouldThrowWhenUserIsNotOwner() {
        User user2 = new User("test_user2", "test2@example.com", "password123");
        user2.setEnabled(true);
        user2.setId(2L);

        Translation translation = Translation.builder()
                .id(100L)
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .success(true)
                .errorMessage(null)
                .timestamp(LocalDateTime.now())
                .user(user2)
                .build();

        when(translationRepository.findById(100L)).thenReturn(Optional.of(translation));

        try (MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

            TranslationException exception = assertThrows(TranslationException.class, () -> {
                translationHistoryService.deleteTranslationById(100L);
            });

            assertTrue(exception.getMessage().contains("do not own"));
            verify(translationRepository, never()).deleteById(anyLong());
        }
    }


}


