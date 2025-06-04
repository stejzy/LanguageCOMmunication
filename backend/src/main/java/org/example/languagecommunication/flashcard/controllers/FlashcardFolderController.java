package org.example.languagecommunication.flashcard.controllers;

import com.google.zxing.WriterException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import org.example.languagecommunication.common.annotations.CheckOwnership;
import org.example.languagecommunication.common.annotations.NoHtml;
import org.example.languagecommunication.common.utils.SecurityUtils;
import org.example.languagecommunication.flashcard.dto.FlashcardFolderRequest;
import org.example.languagecommunication.flashcard.dto.FlashcardRequest;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.services.FlashcardFolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/flashcard-folders")
public class FlashcardFolderController {
    private final FlashcardFolderService flashcardFolderService;

    @Autowired
    public FlashcardFolderController(FlashcardFolderService flashcardFolderService) {
        this.flashcardFolderService = flashcardFolderService;
    }

    @PostMapping
    public ResponseEntity<FlashcardFolder> createFolder(@RequestBody @Valid FlashcardFolderRequest folderRequest) {
        FlashcardFolder folder = new FlashcardFolder();
        folder.setName(folderRequest.getName());
        folder.setUserID(SecurityUtils.getCurrentUserId());
        if (folderRequest.getFlashcards() != null) {
            for (Flashcard flashcard : folderRequest.getFlashcards()) {
                flashcard.setUserID(folder.getUserID());
            }
            folder.getFlashcards().addAll(folderRequest.getFlashcards());
        }
        return ResponseEntity.ok(flashcardFolderService.createFlashcardFolder(folder));
    }

    @CheckOwnership
    @PutMapping("/{id}")
    public ResponseEntity<Object> editFolder(@PathVariable UUID id, @RequestParam @NoHtml String name) {
        return ResponseEntity.ok(flashcardFolderService.editFlashcardFolder(id, name));
    }

    @CheckOwnership
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteFolder(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.deleteFlashcardFolder(id));
    }

    @GetMapping("/user")
    public ResponseEntity<List<FlashcardFolder>> getCurrentUserFolders() {
        return ResponseEntity.ok(flashcardFolderService.getFlashcardFoldersByUser(SecurityUtils.getCurrentUserId()));
    }

    @CheckOwnership
    @GetMapping("/{id}")
    public ResponseEntity<Object> getFolder(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.getFlashcardFolder(id));
    }

    @CheckOwnership
    @PostMapping("/{id}/flashcards")
    public ResponseEntity<Object> addFlashcardToFolder(@PathVariable UUID id, @RequestBody FlashcardRequest flashcardRequest) {
        flashcardFolderService.addFlashcardToFolder(id, flashcardRequest.getFlashcardIds());
        return ResponseEntity.ok().build();
    }

    @CheckOwnership
    @DeleteMapping("/{id}/flashcards")
    public ResponseEntity<Object> removeFlashcardFromFolder(@PathVariable UUID id, @RequestBody FlashcardRequest flashcardRequest) {
        flashcardFolderService.removeFlashcardFromFolder(id, flashcardRequest.getFlashcardIds());
        return ResponseEntity.ok().build();
    }

    @CheckOwnership
    @GetMapping("/{id}/export-qr")
    public ResponseEntity<Object> exportToQR(@PathVariable UUID id) throws IOException, WriterException {
        byte[] qr = flashcardFolderService.exportFolderToQR(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qr.length);
        headers.setContentDisposition(ContentDisposition.inline().filename("folder_qr.png").build());

        return new ResponseEntity<>(qr, headers, HttpStatus.OK);
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<Object> importFolder(@PathVariable UUID id) {
        return ResponseEntity.ok(flashcardFolderService.importFolder(SecurityUtils.getCurrentUserId(), id));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Validation failure");
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<String> handleConstraintViolation(ConstraintViolationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Validation failure");
    }
}
