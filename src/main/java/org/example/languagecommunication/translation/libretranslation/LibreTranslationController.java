package org.example.languagecommunication.translation.libretranslation;

import org.example.languagecommunication.translation.libretranslation.DTO.LibreDetectionText;
import org.example.languagecommunication.translation.libretranslation.DTO.LibreTranslationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class LibreTranslationController {

    private final LibreTranslationService libreTranslationService;

    public LibreTranslationController(LibreTranslationService libreTranslationService) {
        this.libreTranslationService = libreTranslationService;
    }

    @GetMapping("/translate")
    public Mono<ResponseEntity<String>> translate(@RequestParam String text,
                                          @RequestParam String sourceLanguage,
                                          @RequestParam String targetLanguage,
                                          @RequestParam(required = false, defaultValue = "text") String format) {
        LibreTranslationRequest request = LibreTranslationRequest.builder()
                .text(text)
                .sourceLanguage(sourceLanguage)
                .targetLanguage(targetLanguage)
                .format(format)
                .build();
        return libreTranslationService.translate(request)
                .map(response -> ResponseEntity.ok().body(response));
    }

    @GetMapping("/detect")
    public Mono<ResponseEntity<String>> detectLanguage(@RequestParam String text) {
        LibreDetectionText detectionText = new LibreDetectionText(text);
        return libreTranslationService.detectLanguage(detectionText)
                .map(response -> ResponseEntity.ok().body(response));

    }
}
