package org.example.languagecommunication.flashcard.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.languagecommunication.flashcard.models.Card;
import org.example.languagecommunication.flashcard.models.CardStatus;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FlashcardService implements IFlashcardService {
    private final FlashcardRepository flashcardRepository;

    @Autowired
    public FlashcardService(FlashcardRepository flashcardRepository) {
        this.flashcardRepository = flashcardRepository;
    }

    @Override
    public Card addFlashcard(Card card) {
        return flashcardRepository.save(card);
    }

    @Override
    public Card editFlashcard(Long id, CardStatus newStatus) {
        Card card = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product with id " + id + " not found."));
        card.setStatus(newStatus);
        return flashcardRepository.save(card);
    }

    @Override
    public Card deleteFlashcard(Long id) {
        Card card = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product with id " + id + " not found."));

        flashcardRepository.deleteById(id);
        return card;
    }

    @Override
    public List<Card> getCards(UUID userID) {
        return flashcardRepository.findByUserID(userID);
    }

    @Override
    public Card reviewCard(Long id, boolean isCorrect) {
        Card card = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product with id " + id + " not found."));

        card.markReviewed(isCorrect);
        return flashcardRepository.save(card);
    }
}
