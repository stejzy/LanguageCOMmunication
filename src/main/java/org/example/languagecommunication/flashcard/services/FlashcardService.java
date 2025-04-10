package org.example.languagecommunication.flashcard.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;
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
    public Flashcard addFlashcard(Flashcard flashcard) {
        return flashcardRepository.save(flashcard);
    }

    @Override
    @Transactional
    public Flashcard editFlashcard(Long id, FlashcardStatus newStatus) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + id + " not found."));
        flashcard.setStatus(newStatus);
        return flashcardRepository.save(flashcard);
    }

    @Override
    @Transactional
    public void deleteFlashcard(Long id) {
        flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + id + " not found."));

        flashcardRepository.deleteById(id);
    }

    @Override
    public List<Flashcard> getFlashcardsByUser(UUID userID) {
        return flashcardRepository.findByUserID(userID);
    }

    @Override
    public Flashcard getFlashcard(Long id) {
        return flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + id + " not found."));
    }

    @Override
    @Transactional
    public Flashcard reviewFlashcard(Long id, boolean isCorrect) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + id + " not found."));

        flashcard.markReviewed(isCorrect);
        return flashcardRepository.save(flashcard);
    }
}
