package org.example.languagecommunication.translation.awtranslation;

import org.example.languagecommunication.translation.awtranslation.DTO.DetectedLanguage;
import org.example.languagecommunication.translation.awtranslation.DTO.LanguageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AwsTranslationController {

    private final AwsTranslationService awsTranslationService;

    @Autowired
    public AwsTranslationController(AwsTranslationService awsTranslationService) {
        this.awsTranslationService = awsTranslationService;
    }

    @GetMapping("/translate")
    public ResponseEntity<String> translateText(@RequestParam String text,
                                                @RequestParam String sourceLang,
                                                @RequestParam String targetLang) {
        String translatedText = awsTranslationService.translateText(text, sourceLang, targetLang);
        return ResponseEntity.ok(translatedText);
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


}
