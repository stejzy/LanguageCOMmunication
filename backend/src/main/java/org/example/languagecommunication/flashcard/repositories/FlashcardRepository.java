package org.example.languagecommunication.flashcard.repositories;

import org.example.languagecommunication.flashcard.models.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByUserID(Long userID);
}
