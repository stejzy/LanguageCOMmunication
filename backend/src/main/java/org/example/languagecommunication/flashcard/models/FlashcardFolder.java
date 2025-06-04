package org.example.languagecommunication.flashcard.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@NoArgsConstructor
public class FlashcardFolder {
    @Setter
    private Long userID;
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "flashcard_folder_assignment",
            joinColumns = @JoinColumn(referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(referencedColumnName = "id")
    )
    @Setter
    private List<Flashcard> flashcards = new ArrayList<>();

    @Setter
    private String name;
    private final LocalDateTime createdAt = LocalDateTime.now();

    public FlashcardFolder(List<Flashcard> flashcards, String name) {
        this.flashcards = flashcards;
        this.name = name;
    }

    public boolean addFlashcard(Flashcard flashcard) {
        if (flashcards.contains(flashcard)) {
            return false;
        }
        flashcards.add(flashcard);
        flashcard.getFolders().add(this);
        return true;
    }

    public boolean removeFlashcard(Flashcard flashcard) {
        if (!flashcards.contains(flashcard)) {
            return false;
        }
        flashcards.remove(flashcard);
        flashcard.getFolders().remove(this);
        return true;
    }
}
