package org.example.languagecommunication.translation.awstranslation.DTO;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
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