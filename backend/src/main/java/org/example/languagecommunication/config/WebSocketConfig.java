package org.example.languagecommunication.config;

import org.example.languagecommunication.textspeech.TranscriptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private  final TranscriptionHandler transcriptionHandler;

    public WebSocketConfig(TranscriptionHandler transcriptionHandler) {
        this.transcriptionHandler = transcriptionHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(transcriptionHandler, "/ws/transcription")
                .setAllowedOrigins("*");
    }
}
