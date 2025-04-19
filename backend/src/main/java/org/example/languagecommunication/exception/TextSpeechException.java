package org.example.languagecommunication.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class TextSpeechException extends RuntimeException {
    private final HttpStatus status;

    public TextSpeechException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
