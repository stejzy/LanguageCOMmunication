package org.example.languagecommunication.translation.unitTests.controller;

import org.example.languagecommunication.auth.service.JwtService;
import org.example.languagecommunication.translation.awstranslation.DTO.DetectedLanguage;
import org.example.languagecommunication.translation.awstranslation.DTO.LanguageDTO;
import org.example.languagecommunication.translation.awstranslation.DTO.TranslationDTO;
import org.example.languagecommunication.translation.awstranslation.controller.AwsTranslationController;
import org.example.languagecommunication.translation.awstranslation.service.AwsTranslationService;
import org.example.languagecommunication.translation.awstranslation.service.TranslationHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AwsTranslationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
public class AwsTranslationControllerTest {
    @Autowired
    MockMvc mockMvc;

    //Nie wiem czemu to musi być
    @MockitoBean
    JwtService jwtService;

    @MockitoBean
    AwsTranslationService awsTranslationService;

    @MockitoBean
    TranslationHistoryService translationHistoryService;

    @Test
    public void translateText_shouldReturnTranslationDTO() throws Exception {
        TranslationDTO translationDTO = TranslationDTO.builder()
                .id(1L)
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .success(true)
                .errorMessage(null)
                .timestamp(LocalDateTime.now())
                .build();

        when(awsTranslationService.translateText("Hello", "en", "pl"))
                .thenReturn(translationDTO);

        mockMvc.perform(get("/translate")
                        .param("text", "Hello")
                        .param("sourceLang", "en")
                        .param("targetLang", "pl")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.translatedText").value("Cześć"))
                .andExpect(jsonPath("$.sourceLanguage").value("en"))
                .andExpect(jsonPath("$.targetLanguage").value("pl"));
    }

    @Test
    public void detectLanguage_shouldReturnDetectedLanguage() throws Exception{
        DetectedLanguage detectedLanguage = DetectedLanguage.builder()
                .languageCode("en")
                .confidenceScore(0.99f)
                .build();

        when(awsTranslationService.detectLanguage("Hello, my friend.")).thenReturn(detectedLanguage);


        mockMvc.perform(get("/detectLanguage")
                        .param("text", "Hello, my friend.")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.languageCode").value("en"))
                .andExpect(jsonPath("$.confidenceScore").value(0.99f));
    }

    @Test
    public void getSupportedLanguages_shouldReturnListOfLanguageDTO() throws Exception {
        List<LanguageDTO> supportedLanguages = List.of(
                LanguageDTO.builder()
                        .languageCode("en")
                        .languageName("English")
                        .voiceID("voice1")
                        .transcribeLangCode("en-US")
                        .languageNamePL("Angielski")
                        .build(),
                LanguageDTO.builder()
                        .languageCode("pl")
                        .languageName("Polish")
                        .voiceID("voice2")
                        .transcribeLangCode("pl-PL")
                        .languageNamePL("Polski")
                        .build()
        );

        when(awsTranslationService.getSupportedLanguages()).thenReturn(supportedLanguages);

        mockMvc.perform(get("/supportedLanguages")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].languageCode").value("en"))
                .andExpect(jsonPath("$[0].languageName").value("English"))
                .andExpect(jsonPath("$[1].languageCode").value("pl"))
                .andExpect(jsonPath("$[1].languageName").value("Polish"));
    }

    @Test
    public void getAllTranslations_shouldReturnListOfTranslationDTO() throws Exception {
        List<TranslationDTO> translations = List.of(
                TranslationDTO.builder()
                        .id(1L)
                        .sourceText("Hello")
                        .translatedText("Cześć")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .build(),
                TranslationDTO.builder()
                        .id(2L)
                        .sourceText("Goodbye")
                        .translatedText("Do widzenia")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        when(translationHistoryService.getAllTranslations()).thenReturn(translations);

        mockMvc.perform(get("/translations/all")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].translatedText").value("Cześć"))
                .andExpect(jsonPath("$[1].translatedText").value("Do widzenia"));
    }

    @Test
    public void getSuccessfulTranslations_shouldReturnListOfSuccessfulTranslationDTO() throws Exception {
        List<TranslationDTO> successfulTranslations = List.of(
                TranslationDTO.builder()
                        .id(1L)
                        .sourceText("Hello")
                        .translatedText("Cześć")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .build(),
                TranslationDTO.builder()
                        .id(2L)
                        .sourceText("Goodbye")
                        .translatedText("Do widzenia")
                        .sourceLanguage("en")
                        .targetLanguage("pl")
                        .success(true)
                        .errorMessage(null)
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        when(translationHistoryService.getSuccessfulTranslations()).thenReturn(successfulTranslations);

        mockMvc.perform(get("/translations/successful")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].success").value(true))
                .andExpect(jsonPath("$[1].success").value(true));
    }

    @Test
    public void deleteTranslation_shouldReturnNoContent() throws Exception {
        Long idToDelete = 1L;

        doNothing().when(translationHistoryService).deleteTranslationById(idToDelete);

        mockMvc.perform(delete("/translations/delete/{id}", idToDelete))
                .andDo(print())
                .andExpect(status().isNoContent());
    }



}