package org.example.languagecommunication.translation.awtranslation;

import org.example.languagecommunication.exception.LanguageDetectionException;
import org.example.languagecommunication.translation.awtranslation.DTO.DetectedLanguage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.*;
import software.amazon.awssdk.services.translate.TranslateClient;
import software.amazon.awssdk.services.translate.model.DetectedLanguageLowConfidenceException;
import software.amazon.awssdk.services.translate.model.TranslateTextRequest;
import software.amazon.awssdk.services.translate.model.TranslateTextResponse;
import software.amazon.awssdk.services.translate.model.UnsupportedLanguagePairException;

import java.nio.charset.StandardCharsets;

@Service
public class AwsTranslationService {

    private final TranslateClient translateClient;
    private final ComprehendClient comprehendClient;

    @Autowired
    public AwsTranslationService
            (TranslateClient translateClient,
             ComprehendClient comprehendClient) {
        this.translateClient = translateClient;
        this.comprehendClient = comprehendClient;
    }

    public String translateText(String text, String sourceLang, String targetLang) {
        try {
            TranslateTextRequest request = TranslateTextRequest.builder()
                    .text(text)
                    .sourceLanguageCode(sourceLang)
                    .targetLanguageCode(targetLang)
                    .build();

            TranslateTextResponse response = translateClient.translateText(request);
            return response.translatedText();
        } catch (UnsupportedLanguagePairException | DetectedLanguageLowConfidenceException e) {
            throw e;
        } catch ( Exception e) {
            throw new RuntimeException("Unexpected translation failed: " + e.getMessage(), e);
        }
    }

    public DetectedLanguage detectLanguage(String text) {
        try {
            if (text == null || text.trim().isEmpty()) {
                throw new LanguageDetectionException("Text must not be null or empty", HttpStatus.BAD_REQUEST);
            }

            if (text.getBytes(StandardCharsets.UTF_8).length > 5000) {
                throw new LanguageDetectionException("Text exceeds the 5000-byte limit", HttpStatus.BAD_REQUEST);
            }

            DetectDominantLanguageRequest request = DetectDominantLanguageRequest.builder()
                    .text(text)
                    .build();

            DetectDominantLanguageResponse response = comprehendClient.detectDominantLanguage(request);

            return response
                    .languages()
                    .stream()
                    .map(language -> new DetectedLanguage(language.languageCode(), language.score()))
                    .findFirst()
                    .orElseThrow(() -> new LanguageDetectionException("No dominant language detected", HttpStatus.NOT_FOUND));
        } catch (InvalidRequestException e) {
            throw new LanguageDetectionException("Invalid request to AWS Comprehend", HttpStatus.BAD_REQUEST, e);
        } catch (TextSizeLimitExceededException e) {
            throw new LanguageDetectionException("Text too long for AWS Comprehend", HttpStatus.BAD_REQUEST, e);
        } catch (TooManyRequestsException e) {
            throw new LanguageDetectionException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS, e);
        } catch (InternalServerException e) {
            throw new LanguageDetectionException("Internal error from AWS Comprehend", HttpStatus.INTERNAL_SERVER_ERROR, e);
        } catch (LanguageDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Unexpected language detection failed: " + e.getMessage(), e);
        }
    }
}
