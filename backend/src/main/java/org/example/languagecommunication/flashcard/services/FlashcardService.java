package org.example.languagecommunication.flashcard.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardStatus;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + id + " not found."));

        for (var folder : new ArrayList<>(flashcard.getFolders())) {
            folder.removeFlashcard(flashcard);
        }

        flashcardRepository.deleteById(id);
    }

    @Override
    public List<Flashcard> getFlashcardsByUser(Long userID) {
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

    public Flashcard updateFlashcard(Long id, Flashcard updated) {
        Flashcard flashcard = getFlashcard(id);
        if (updated.getFrontContent() != null) flashcard.setFrontContent(updated.getFrontContent());
        if (updated.getBackContent() != null) flashcard.setBackContent(updated.getBackContent());
        if (updated.getStatus() != null) flashcard.setStatus(updated.getStatus());
        return flashcardRepository.save(flashcard);
    }
}
