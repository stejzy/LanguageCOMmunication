package org.example.languagecommunication.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class ApiError {
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    private int status;
    private String message;
    private String error;
    private String path;
}
