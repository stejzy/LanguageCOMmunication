package org.example.languagecommunication.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import software.amazon.awssdk.services.translate.model.DetectedLanguageLowConfidenceException;
import software.amazon.awssdk.services.translate.model.UnsupportedLanguagePairException;

@RestControllerAdvice
public class GloablExceptionHandler {

    @ExceptionHandler(UnsupportedLanguagePairException.class)
    public ResponseEntity<ApiError> handleUnsupportedLanguagePairException
            (UnsupportedLanguagePairException ex,
             HttpServletRequest request)
    {
        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(apiError);
    }

    @ExceptionHandler(DetectedLanguageLowConfidenceException.class)
    public ResponseEntity<ApiError> handleDetectedLanguageLowConfidenceException
            (DetectedLanguageLowConfidenceException ex,
             HttpServletRequest request)
    {
        ApiError apiError = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(apiError);
    }

    @ExceptionHandler(LanguageDetectionException.class)
    public ResponseEntity<ApiError> handleLanguageDetectionException
            (LanguageDetectionException ex,
             HttpServletRequest request)
    {
        ApiError apiError = ApiError.builder()
                .status(ex.getStatus().value())
                .error(ex.getStatus().getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(ex.getStatus())
                .body(apiError);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleException
            (Exception ex,
             HttpServletRequest request)
    {
        ApiError apiError = ApiError.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(apiError);
    }
}
