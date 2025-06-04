package org.example.languagecommunication.translation.awstranslation.DTO;

import lombok.Builder;

@Builder
public record LanguageDTO(String languageName, String languageCode, String voiceID, String transcribeLangCode, String languageNamePL) {
}
