package org.example.languagecommunication.translation.libretranslation.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record LibreTranslationRequest(
        @JsonProperty("q") String text,
        @JsonProperty("source") String sourceLanguage,
        @JsonProperty("target") String targetLanguage,
        @JsonProperty("format") String format
) {
    private static final String DEFAULT_FORMAT = "text";

    public LibreTranslationRequest(String text, String sourceLanguage, String targetLanguage, String format) {
        this.text = text;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.format = format != null ? format : DEFAULT_FORMAT;
    }
}
