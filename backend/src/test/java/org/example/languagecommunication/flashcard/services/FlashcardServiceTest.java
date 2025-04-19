package org.example.languagecommunication.flashcard.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlashcardServiceTest {

    @Mock
    private FlashcardRepository flashcardRepository;

    @InjectMocks
    private FlashcardService flashcardService;

    private Flashcard flashcard;

    @BeforeEach
    void setUp() {
        flashcard = new Flashcard("Front Content", "Back Content");
        flashcard.setUserID(1L);
    }

    @Test
    void addFlashcard_shouldSaveAndReturnCard() {
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(flashcard);

        Flashcard result = flashcardService.addFlashcard(flashcard);

        assertEquals(flashcard, result);
        verify(flashcardRepository).save(flashcard);
    }

    @Test
    void editFlashcard_shouldUpdateStatus() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(flashcard);

        Flashcard result = flashcardService.editFlashcard(1L, FlashcardStatus.LEARNED);

        assertEquals(FlashcardStatus.LEARNED, result.getStatus());
        verify(flashcardRepository).save(flashcard);
    }

    @Test
    void deleteFlashcard_shouldReturnDeletedCard() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));

        flashcardService.deleteFlashcard(1L);

        verify(flashcardRepository).deleteById(1L);
    }

    @Test
    void getCards_shouldReturnList() {
        Long userId = flashcard.getUserID();
        List<Flashcard> flashcards = List.of(flashcard);
        when(flashcardRepository.findByUserID(userId)).thenReturn(flashcards);

        List<Flashcard> result = flashcardService.getFlashcardsByUser(userId);

        assertEquals(1, result.size());
        assertEquals(flashcard, result.getFirst());
    }

    @Test
    void reviewCardCorrect_shouldMarkReviewed() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(flashcard);

        Flashcard result = flashcardService.reviewFlashcard(1L, true);

        verify(flashcardRepository).save(flashcard);

        assertEquals(1, result.getCorrectResponses());
        assertEquals(0, result.getIncorrectResponses());
    }

    @Test
    void reviewCardInCorrect_shouldMarkReviewed() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(flashcard);

        Flashcard result = flashcardService.reviewFlashcard(1L, false);

        verify(flashcardRepository).save(flashcard);

        assertEquals(0, result.getCorrectResponses());
        assertEquals(1, result.getIncorrectResponses());
    }

    @Test
    void editFlashcard_shouldThrowWhenNotFound() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> flashcardService.editFlashcard(1L, FlashcardStatus.LEARNED));
    }
}