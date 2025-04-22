package org.example.languagecommunication.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenPair {
    private final String accessToken;
    private final String refreshToken;
}
