package org.example.languagecommunication.translation.awstranslation.DTO;

import java.time.LocalDateTime;

public record TranslationDTO(
        Long id,
        String sourceText,
        String translatedText,
        String sourceLanguage,
        String targetLanguage,
        boolean success,
        String errorMessage,
        LocalDateTime timestamp
) {}