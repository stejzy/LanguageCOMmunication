package org.example.languagecommunication.translation.unitTests.service;

import org.example.languagecommunication.exception.LanguageDetectionException;
import org.example.languagecommunication.translation.awstranslation.DTO.DetectedLanguage;
import org.example.languagecommunication.translation.awstranslation.DTO.LanguageDTO;
import org.example.languagecommunication.translation.awstranslation.DTO.TranslationDTO;
import org.example.languagecommunication.translation.awstranslation.model.SupportedLanguage;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.example.languagecommunication.translation.awstranslation.service.AwsTranslationService;
import org.example.languagecommunication.translation.awstranslation.service.TranslationHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageRequest;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageResponse;
import software.amazon.awssdk.services.comprehend.model.DominantLanguage;
import software.amazon.awssdk.services.translate.TranslateClient;
import software.amazon.awssdk.services.translate.model.TranslateTextRequest;
import software.amazon.awssdk.services.translate.model.TranslateTextResponse;
import software.amazon.awssdk.services.translate.model.UnsupportedLanguagePairException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AwsTranslationServiceTest {
    @Mock
    TranslateClient translateClient;

    @Mock
    ComprehendClient comprehendClient;

    @Mock
    TranslationHistoryService translationHistoryService;

    @InjectMocks
    AwsTranslationService awsTranslationService;

    @Test
    public void translateText_shouldReturnTranslationDTO_whenSuccessful() {
        TranslateTextResponse awsResponse = TranslateTextResponse.builder()
                .translatedText("Cześć")
                .build();

        when(translateClient.translateText((TranslateTextRequest) any()))
                .thenReturn(awsResponse);

        Translation savedTranslation = new Translation();
        savedTranslation.setId(1L);
        savedTranslation.setSourceText("Hello");
        savedTranslation.setTranslatedText("Cześć");
        savedTranslation.setSourceLanguage("en");
        savedTranslation.setTargetLanguage("pl");
        savedTranslation.setTimestamp(LocalDateTime.now());
        savedTranslation.setSuccess(true);

        when(translationHistoryService.saveSuccess(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(savedTranslation);

        TranslationDTO result = awsTranslationService.translateText("Hello", "en", "pl");

        assertNotNull(result);
        assertEquals("Cześć", result.translatedText());
        assertEquals("en", result.sourceLanguage());
        assertEquals("pl", result.targetLanguage());
    }

    @Test
    public void translateText_shouldReturnTranslationDTO_whenUnsuccessful(){
        String input = "Hello";
        String sourceLang = "xx";
        String targetLang = "yy";

        when(translateClient.translateText((TranslateTextRequest) any()))
                .thenThrow(
                        UnsupportedLanguagePairException.builder()
                        .message("Unsupported language pair")
                        .build()
                );

        Translation errorTranslation = new Translation();
        errorTranslation.setId(123L);
        errorTranslation.setSourceText(input);
        errorTranslation.setTranslatedText(null);
        errorTranslation.setSourceLanguage(sourceLang);
        errorTranslation.setTargetLanguage(targetLang);
        errorTranslation.setSuccess(false);
        errorTranslation.setErrorMessage("Unsupported language pair");
        errorTranslation.setTimestamp(LocalDateTime.now());

        when(translationHistoryService.saveError(eq(input), eq(sourceLang), eq(targetLang), anyString()))
                .thenReturn(errorTranslation);

        TranslationDTO result = awsTranslationService.translateText(input, sourceLang, targetLang);

        assertNotNull(result);
        assertFalse(result.success());
        assertEquals("Unsupported language pair", result.errorMessage());
        assertEquals(sourceLang, result.sourceLanguage());
        assertEquals(targetLang, result.targetLanguage());
    }

    @Test
    public void detectLanguage_shouldReturnDetectedLanguage_whenSuccessful(){
        List<DominantLanguage> languages = List.of(
                DominantLanguage.builder()
                        .languageCode("en")
                        .score(0.99f)
                        .build()
        );

        DetectDominantLanguageResponse response = DetectDominantLanguageResponse.builder()
                .languages(languages)
                .build();

        when(comprehendClient.detectDominantLanguage((DetectDominantLanguageRequest) any()))
                .thenReturn(response);

        DetectedLanguage detectedLanguage = awsTranslationService.detectLanguage("Hello, my friend.");

        assertNotNull(detectedLanguage);
        assertEquals("en", detectedLanguage.languageCode());
    }

    @Test
    public void detectLanguage_shouldThrowException_whenUnsuccessful() {
        String emptyText = "   ";

        LanguageDetectionException exception = assertThrows(LanguageDetectionException.class, () -> {
            awsTranslationService.detectLanguage(emptyText);
        });

        assertEquals("Text must not be null or empty", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    public void getSupportedLanguages_shouldReturnListOfLanguageDTO(){
        List<LanguageDTO> result = awsTranslationService.getSupportedLanguages();

        SupportedLanguage[] expectedLanguages = SupportedLanguage.values();

        assertNotNull(result);
        assertEquals(expectedLanguages.length, result.size());

        for (int i = 0; i < expectedLanguages.length; i++) {
            SupportedLanguage expected = expectedLanguages[i];
            LanguageDTO actual = result.get(i);

            assertEquals(expected.name(), actual.languageName());
            assertEquals(expected.getLanguageCode(), actual.languageCode());
            assertEquals(expected.getVoiceId(), actual.voiceID());
            assertEquals(expected.getTranscribeLangCode(), actual.transcribeLangCode());
            assertEquals(expected.getLanguageNamePL(), actual.languageNamePL());
        }
    }
}
