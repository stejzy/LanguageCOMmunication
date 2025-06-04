package org.example.languagecommunication.translation.awstranslation.controller;

import org.example.languagecommunication.translation.awstranslation.DTO.DetectedLanguage;
import org.example.languagecommunication.translation.awstranslation.DTO.LanguageDTO;
import org.example.languagecommunication.translation.awstranslation.DTO.TranslationDTO;
import org.example.languagecommunication.translation.awstranslation.service.AwsTranslationService;
import org.example.languagecommunication.translation.awstranslation.service.TranslationHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AwsTranslationController {

    private final AwsTranslationService awsTranslationService;
    private final TranslationHistoryService translationHistoryService;

    @Autowired
    public AwsTranslationController(AwsTranslationService awsTranslationService,
                                    TranslationHistoryService translationHistoryService) {
        this.awsTranslationService = awsTranslationService;
        this.translationHistoryService = translationHistoryService;
    }

    @GetMapping("/translate")
    public ResponseEntity<TranslationDTO> translateText(@RequestParam String text,
                                                        @RequestParam String sourceLang,
                                                        @RequestParam String targetLang) {
        TranslationDTO translationDTO = awsTranslationService.translateText(text, sourceLang, targetLang);
        return ResponseEntity.ok(translationDTO);
    }

    @GetMapping("/detectLanguage")
    public ResponseEntity<DetectedLanguage> detectLanguage(@RequestParam String text) {
        DetectedLanguage detectedLanguage = awsTranslationService.detectLanguage(text);
        return ResponseEntity.ok(detectedLanguage);
    }

    @GetMapping("/supportedLanguages")
    public ResponseEntity<List<LanguageDTO>> getSupportedLanguages() {
        List<LanguageDTO> supportedLanguages = awsTranslationService.getSupportedLanguages();
        return ResponseEntity.ok(supportedLanguages);
    }

    @GetMapping("/translations/all")
    public ResponseEntity<List<TranslationDTO>> getAllTranslations() {
        List<TranslationDTO> translations = translationHistoryService.getAllTranslations();
        return ResponseEntity.ok(translations);
    }

    @GetMapping("/translations/successful")
    public ResponseEntity<List<TranslationDTO>> getSuccessfulTranslations() {
        List<TranslationDTO> successfulTranslations = translationHistoryService.getSuccessfulTranslations();
        return ResponseEntity.ok(successfulTranslations);
    }

    @DeleteMapping("/translations/delete/{id}")
    public ResponseEntity<Void> deleteTranslation(@PathVariable Long id) {
        translationHistoryService.deleteTranslationById(id);
        return ResponseEntity.noContent().build();
    }

}
