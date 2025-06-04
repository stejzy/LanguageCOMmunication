package org.example.languagecommunication.translation.awstranslation.DTO;

import lombok.Builder;

@Builder
public record DetectedLanguage(String languageCode, float confidenceScore) {
}
