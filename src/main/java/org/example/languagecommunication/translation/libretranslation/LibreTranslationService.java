package org.example.languagecommunication.translation.libretranslation;

import org.example.languagecommunication.exception.DetectionError;
import org.example.languagecommunication.exception.TranslationException;
import org.example.languagecommunication.translation.TranslationService;
import org.example.languagecommunication.translation.libretranslation.DTO.LibreDetectionText;
import org.example.languagecommunication.translation.libretranslation.DTO.LibreTranslationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class LibreTranslationService implements TranslationService {

    private final WebClient webClient;

    @Autowired
    public LibreTranslationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public Mono<String> translate(LibreTranslationRequest request) {
        Mono<String> translatedText = webClient
                .post()
                .uri("/translate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> {
                    if (e instanceof WebClientResponseException ex) {
                        String responseBody = ex.getResponseBodyAsString();
                        HttpStatus status = (HttpStatus) ex.getStatusCode();
                        return Mono.error(new TranslationException(responseBody, status));
                    }
                    return Mono.error(new RuntimeException(e.getMessage()));
                });
        return translatedText;
    }


    @Override
    public Mono<String> detectLanguage(LibreDetectionText text) {
        return webClient
                .post()
                .uri("/detect")
                .bodyValue(text)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> {
                    if (e instanceof WebClientResponseException ex) {
                        String responseBody = ex.getResponseBodyAsString();
                        HttpStatus status = (HttpStatus) ex.getStatusCode();
                        return Mono.error(new DetectionError(responseBody, status));
                    }
                    return Mono.error(new RuntimeException(e.getMessage()));
                });
    }

}
