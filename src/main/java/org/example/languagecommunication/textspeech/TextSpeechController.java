package org.example.languagecommunication.textspeech;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TextSpeechController {
    private final TextSpeechService textSpeechService;

    @Autowired
    public TextSpeechController(TextSpeechService textSpeechService) {
        this.textSpeechService = textSpeechService;
    }

    @GetMapping("/text-to-speech")
    public ResponseEntity<byte[]> convertTextToSpeech(String text, String language) {
        byte[] audioBytes = textSpeechService.convertTextToSpeech(text, language);
        return ResponseEntity
                .ok()
                .contentType(MediaType.valueOf("audio/mpeg"))
                .body(audioBytes);

    }
}
