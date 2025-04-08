package org.example.languagecommunication.translation.libretranslation.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LibreDetectionText(
        @JsonProperty ("q") String text
) {
}
