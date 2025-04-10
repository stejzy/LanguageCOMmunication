package org.example.languagecommunication.flashcard.controllers;

import com.google.zxing.WriterException;
import jakarta.persistence.EntityNotFoundException;
import org.example.languagecommunication.flashcard.dto.FlashcardRequest;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.services.FlashcardFolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcard-folders")
public class FlashcardFolderController {
    private final FlashcardFolderService flashcardFolderService;

    @Autowired
    public FlashcardFolderController(FlashcardFolderService flashcardFolderService) {
        this.flashcardFolderService = flashcardFolderService;
    }

    @PostMapping
    public ResponseEntity<FlashcardFolder> createFolder(@RequestBody FlashcardFolder folder) {
        return ResponseEntity.ok(flashcardFolderService.createFlashcardFolder(folder));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardFolder> editFolder(@PathVariable UUID id, @RequestParam String name) {
        return ResponseEntity.ok(flashcardFolderService.editFlashcardFolder(id, name));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<FlashcardFolder> deleteFolder(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.deleteFlashcardFolder(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FlashcardFolder>> getUserFolders(@PathVariable UUID userId) {
        return ResponseEntity.ok(flashcardFolderService.getFlashcardFoldersByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardFolder> getFolder(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.getFlashcardFolder(id));
    }

    @PostMapping("/{id}/flashcards")
    public ResponseEntity<Void> addFlashcardToFolder(@PathVariable UUID id, @RequestBody FlashcardRequest flashcardRequest) {
        flashcardFolderService.addFlashcardToFolder(id, flashcardRequest.getFlashcardIds());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/flashcards")
    public ResponseEntity<Void> removeFlashcardFromFolder(@PathVariable UUID id, @RequestBody FlashcardRequest flashcardRequest) {
        flashcardFolderService.removeFlashcardFromFolder(id, flashcardRequest.getFlashcardIds());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/export-qr")
    public ResponseEntity<byte[]> exportToQR(@PathVariable UUID id) throws IOException, WriterException {
        byte[] qr = flashcardFolderService.exportFolderToQR(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qr.length);
        headers.setContentDisposition(ContentDisposition.inline().filename("folder_qr.png").build());

        return new ResponseEntity<>(qr, headers, HttpStatus.OK);
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<FlashcardFolder> importFolder(@RequestParam UUID userId, @PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.importFolder(userId, id));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
