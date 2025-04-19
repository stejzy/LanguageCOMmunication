package org.example.languagecommunication.textspeech;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import software.amazon.awssdk.services.transcribestreaming.TranscribeStreamingAsyncClient;
import software.amazon.awssdk.services.transcribestreaming.model.*;

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.List;

@Component
public class TranscriptionHandler extends BinaryWebSocketHandler {

    private final TranscribeStreamingAsyncClient transcribeClient;
    private PipedOutputStream audioOutput;
    private PipedInputStream audioInput;

    public TranscriptionHandler(TranscribeStreamingAsyncClient transcribeClient) {
        this.transcribeClient = transcribeClient;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("🔌 WebSocket connected: " + session.getId());
        audioOutput = new PipedOutputStream();
        audioInput = new PipedInputStream(audioOutput);

        StartStreamTranscriptionRequest request = StartStreamTranscriptionRequest.builder()
                .languageCode(LanguageCode.EN_US.toString())
                .mediaEncoding(MediaEncoding.PCM)
                .mediaSampleRateHertz(16000)
                .build();

        System.out.println("🚀 Starting transcription stream...");

        transcribeClient.startStreamTranscription(
                request,
                new AudioStreamPublisher(audioInput),
                StartStreamTranscriptionResponseHandler.builder()
                        .onResponse(r -> System.out.println("✅ Transcription stream started. Response: " + r))
                        .onError(e -> {
                            System.err.println("❌ Error in transcription stream:");
                            e.printStackTrace();
                        })
                        .onComplete(() -> System.out.println("✅ Transcription stream completed."))
                        .subscriber(event -> {
                            if (event instanceof TranscriptEvent) {
                                List<Result> results = ((TranscriptEvent) event).transcript().results();
                                for (Result result : results) {
                                    if (!result.isPartial()) {
                                        String text = result.alternatives().getFirst().transcript();
                                        System.out.println("📝 Transcribed text: " + text);
                                        try {
                                            session.sendMessage(new TextMessage(text));
                                        } catch (IOException e) {
                                            System.err.println("❌ Error sending transcribed text to client:");
                                            e.printStackTrace();
                                        }
                                    } else {
                                        System.out.println("⌛ Partial transcript received (not sent): " +
                                                result.alternatives().getFirst().transcript());
                                    }
                                }
                            }
                        })
                        .build()
        );
    }

    @Override
    public void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        System.out.println("🎧 Received binary audio data: " + message.getPayloadLength() + " bytes");
        try {
            audioOutput.write(message.getPayload().array());
            audioOutput.flush();
            System.out.println("✔️ Audio data written to the stream.");
        } catch (IOException e) {
            System.err.println("❌ Error writing audio data:");
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("🔌 WebSocket closed: " + session.getId() + " - Reason: " + status.getReason());
        if (audioOutput != null) audioOutput.close();
        if (audioInput != null) audioInput.close();
    }
}

