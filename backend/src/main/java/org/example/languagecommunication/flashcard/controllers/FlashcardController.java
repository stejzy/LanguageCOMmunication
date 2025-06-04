package org.example.languagecommunication.flashcard.controllers;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.example.languagecommunication.common.annotations.CheckOwnership;
import org.example.languagecommunication.common.utils.SecurityUtils;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;
import org.example.languagecommunication.flashcard.services.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    @Autowired
    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping
    public ResponseEntity<Flashcard> addFlashcard(@RequestBody @Valid Flashcard flashcard) {
        Long userId = SecurityUtils.getCurrentUserId();
        flashcard.setUserID(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(flashcardService.addFlashcard(flashcard));
    }

    @CheckOwnership
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> editFlashcardStatus(@PathVariable Long id, @RequestParam FlashcardStatus status) {
        return ResponseEntity.ok(flashcardService.editFlashcard(id, status));
    }

    @CheckOwnership
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user")
    public ResponseEntity<Object> geCurrentUserFlashcards() {
        return ResponseEntity.ok(flashcardService.getFlashcardsByUser(SecurityUtils.getCurrentUserId()));
    }

    @CheckOwnership
    @GetMapping("/{id}")
    public ResponseEntity<Object> getFlashcard(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.getFlashcard(id));
    }


    @CheckOwnership
    @PostMapping("/{id}/review")
    public ResponseEntity<Object> reviewFlashcard(
            @PathVariable Long id,
            @RequestParam boolean correct
    ) {
        return ResponseEntity.ok(flashcardService.reviewFlashcard(id, correct));
    }

    @CheckOwnership
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateFlashcard(@PathVariable Long id, @RequestBody @Valid Flashcard updated) {
        return ResponseEntity.ok(flashcardService.updateFlashcard(id, updated));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
}
