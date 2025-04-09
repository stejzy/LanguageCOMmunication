package org.example.languagecommunication.flashcard.services;

import org.example.languagecommunication.flashcard.models.Card;
import org.example.languagecommunication.flashcard.models.CardStatus;

import java.util.List;
import java.util.UUID;

public interface IFlashcardService {
    Card addFlashcard(Card card);
    Card editFlashcard(Long id, CardStatus newStatus);
    Card deleteFlashcard(Long id);
    List<Card> getCards(UUID userID);
    Card reviewCard(Long id, boolean isCorrect);
}
