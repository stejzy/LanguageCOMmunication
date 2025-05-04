package org.example.languagecommunication.phrase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phrases")
public class PhraseController {

    private final PhraseService phraseService;

    @Autowired
    public PhraseController(PhraseService phraseService) {
        this.phraseService = phraseService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generatePhrase(@RequestBody String phrase) {
        String response = phraseService.getResponse(phrase);
        return ResponseEntity.ok(response);
    }
}
