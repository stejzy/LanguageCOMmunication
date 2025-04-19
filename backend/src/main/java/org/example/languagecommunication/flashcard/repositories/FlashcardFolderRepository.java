package org.example.languagecommunication.flashcard.repositories;

import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FlashcardFolderRepository extends JpaRepository<FlashcardFolder, UUID> {
    List<FlashcardFolder> findByUserID(Long userID);
}
