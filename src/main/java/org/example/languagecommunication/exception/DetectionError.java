package org.example.languagecommunication.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class DetectionError extends RuntimeException {
    private final HttpStatus status;

    public DetectionError(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
