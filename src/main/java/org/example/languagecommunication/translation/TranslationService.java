package org.example.languagecommunication.translation;

import org.example.languagecommunication.translation.libretranslation.DTO.LibreDetectionText;
import org.example.languagecommunication.translation.libretranslation.DTO.LibreTranslationRequest;
import reactor.core.publisher.Mono;

public interface TranslationService {
    Mono<String> translate(LibreTranslationRequest request);
    Mono<String> detectLanguage(LibreDetectionText text);
}
