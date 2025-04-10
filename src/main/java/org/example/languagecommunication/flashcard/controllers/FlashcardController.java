package org.example.languagecommunication.flashcard.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;
import org.example.languagecommunication.flashcard.services.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    @Autowired
    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping
    public ResponseEntity<Flashcard> addFlashcard(@RequestBody Flashcard flashcard) {
        Flashcard createdFlashcard = flashcardService.addFlashcard(flashcard);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFlashcard);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Flashcard> editFlashcardStatus(@PathVariable Long id, @RequestParam FlashcardStatus status) {
        return ResponseEntity.ok(flashcardService.editFlashcard(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Flashcard>> getFlashcardsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(flashcardService.getFlashcardsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flashcard> getFlashcard(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.getFlashcard(id));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Flashcard> reviewFlashcard(
            @PathVariable Long id,
            @RequestParam boolean correct
    ) {
        return ResponseEntity.ok(flashcardService.reviewFlashcard(id, correct));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
