package org.example.languagecommunication.phrase;

import org.springframework.stereotype.Service;
import org.springframework.http.*;

import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

import io.github.cdimascio.dotenv.Dotenv;


@Service
public class PhraseService {

    private final WebClient webClient;

    private final String apiKey;

    public PhraseService() {
        Dotenv dotenv = Dotenv.load();
        this.apiKey = dotenv.get("GROQ_API_KEY");
        this.webClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String getResponse(String phrase) {
        Map<String, Object> requestBody = Map.of(
                "model", "llama3-70b-8192",
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", "Generate a short and natural phrase (in the same language as the word provided) that includes the given word. \n" +
                                        "The response must consist of only the phrase — do not include any quotation marks or additional formatting. \n" +
                                        "If the word is not valid, unknown, or cannot be used in a sentence, respond with exactly the same word.\n The word is: " + phrase
                        )
                )
        );

        try {
            return webClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Zwraca String synchronizacyjnie
        } catch (Exception e) {
            return "Błąd przy komunikacji z Groq: " + e.getMessage();
        }
    }
}