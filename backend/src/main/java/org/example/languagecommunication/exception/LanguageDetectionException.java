package org.example.languagecommunication.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class LanguageDetectionException extends RuntimeException {
    private final HttpStatus status;

    public LanguageDetectionException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public LanguageDetectionException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

}
