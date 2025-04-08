package org.example.languagecommunication.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
public class TranslationException extends RuntimeException{
    private final HttpStatus status;

    public TranslationException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
