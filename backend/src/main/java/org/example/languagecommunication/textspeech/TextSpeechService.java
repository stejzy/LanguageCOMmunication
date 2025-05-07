package org.example.languagecommunication.textspeech;

import org.example.languagecommunication.exception.TextSpeechException;
import org.example.languagecommunication.translation.awstranslation.SupportedLanguage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.polly.PollyClient;
import software.amazon.awssdk.services.polly.model.OutputFormat;
import software.amazon.awssdk.services.polly.model.SynthesizeSpeechRequest;
import software.amazon.awssdk.services.polly.model.SynthesizeSpeechResponse;

import java.io.ByteArrayOutputStream;

@Service
public class TextSpeechService {
    private final PollyClient pollyClient;

    public TextSpeechService(PollyClient pollyClient) {
        this.pollyClient = pollyClient;
    }

    public byte[] convertTextToSpeech(String text, String langCode) {
        try {
            if(text == null || text.isEmpty()) {
                throw new TextSpeechException("Text cannot be null or empty", HttpStatus.BAD_REQUEST);
            }

            if (text.length() > 3000) {
                throw new TextSpeechException("Text length exceeds the limit of 3000 characters", HttpStatus.BAD_REQUEST);
            }

            SupportedLanguage supportedLanguage = SupportedLanguage.fromLanguageCode(langCode);
            String voiceId = supportedLanguage.getVoiceId();
            String engine = supportedLanguage.getEngine().trim();

            SynthesizeSpeechRequest request = SynthesizeSpeechRequest.builder()
                    .text(text)
                    .voiceId(voiceId)
                    .outputFormat(OutputFormat.MP3)
                    .engine(engine)
                    .build();

            try (ResponseInputStream<SynthesizeSpeechResponse> response = pollyClient.synthesizeSpeech(request)) {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                byte[] buffer = new byte[2 * 1024];
                int read;
                while ((read = response.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, read);
                }

                return outputStream.toByteArray();
            }

        } catch (IllegalArgumentException e) {
            throw new TextSpeechException("Unsupported language code: " + langCode, HttpStatus.BAD_REQUEST);
        } catch (TextSpeechException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error converting text to speech: " + e.getMessage(), e);
        }

    }
}
