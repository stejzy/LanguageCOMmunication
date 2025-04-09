package org.example.languagecommunication.flashcard.repositories;

import org.example.languagecommunication.flashcard.models.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Card, Long> {
    List<Card> findByUserID(UUID userID);
}
