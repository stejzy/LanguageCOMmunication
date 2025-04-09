package org.example.languagecommunication.flashcard.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.languagecommunication.flashcard.models.Card;
import org.example.languagecommunication.flashcard.models.CardStatus;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    private Card card;

    @BeforeEach
    void setUp() {
        card = new Card(UUID.randomUUID(), "Front Content", "Back Content");
    }

    @Test
    void addFlashcard_shouldSaveAndReturnCard() {
        when(flashcardRepository.save(any(Card.class))).thenReturn(card);

        Card result = flashcardService.addFlashcard(card);

        assertEquals(card, result);
        verify(flashcardRepository).save(card);
    }

    @Test
    void editFlashcard_shouldUpdateStatus() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(flashcardRepository.save(any(Card.class))).thenReturn(card);

        Card result = flashcardService.editFlashcard(1L, CardStatus.LEARNED);

        assertEquals(CardStatus.LEARNED, result.getStatus());
        verify(flashcardRepository).save(card);
    }

    @Test
    void deleteFlashcard_shouldReturnDeletedCard() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(card));

        Card result = flashcardService.deleteFlashcard(1L);

        assertEquals(card, result);
        verify(flashcardRepository).deleteById(1L);
    }

    @Test
    void getCards_shouldReturnList() {
        UUID userId = card.getUserID();
        List<Card> cards = List.of(card);
        when(flashcardRepository.findByUserID(userId)).thenReturn(cards);

        List<Card> result = flashcardService.getCards(userId);

        assertEquals(1, result.size());
        assertEquals(card, result.getFirst());
    }

    @Test
    void reviewCardCorrect_shouldMarkReviewed() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(flashcardRepository.save(any(Card.class))).thenReturn(card);

        Card result = flashcardService.reviewCard(1L, true);

        verify(flashcardRepository).save(card);

        assertEquals(1, result.getCorrectResponses());
        assertEquals(0, result.getIncorrectResponses());
    }

    @Test
    void reviewCardInCorrect_shouldMarkReviewed() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(flashcardRepository.save(any(Card.class))).thenReturn(card);

        Card result = flashcardService.reviewCard(1L, false);

        verify(flashcardRepository).save(card);

        assertEquals(0, result.getCorrectResponses());
        assertEquals(1, result.getIncorrectResponses());
    }

    @Test
    void editFlashcard_shouldThrowWhenNotFound() {
        when(flashcardRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> flashcardService.editFlashcard(1L, CardStatus.LEARNED));
    }
}