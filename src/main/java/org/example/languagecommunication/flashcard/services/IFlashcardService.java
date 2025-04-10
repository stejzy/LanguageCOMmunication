package org.example.languagecommunication.flashcard.services;

import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;

import java.util.List;
import java.util.UUID;

public interface IFlashcardService {
    Flashcard addFlashcard(Flashcard flashcard);
    Flashcard editFlashcard(Long id, FlashcardStatus newStatus);
    void deleteFlashcard(Long id);
    List<Flashcard> getFlashcardsByUser(UUID userID);
    Flashcard getFlashcard(Long id);
    Flashcard reviewFlashcard(Long id, boolean isCorrect);
}
