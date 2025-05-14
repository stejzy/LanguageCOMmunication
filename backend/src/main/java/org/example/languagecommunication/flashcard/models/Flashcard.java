package org.example.languagecommunication.flashcard.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@NoArgsConstructor
@Entity
public class Flashcard implements Serializable {
    @Setter
    private Long userID;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Setter
    private String frontContent;
    @Setter
    private String backContent;
    @Setter
    private FlashcardStatus status = FlashcardStatus.ACTIVE;

    private final LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastReviewedAt = LocalDateTime.now();

    private int correctResponses = 0;
    private int incorrectResponses = 0;

    @JsonIgnore
    @ManyToMany(mappedBy = "flashcards")
    private List<FlashcardFolder> folders = new ArrayList<>();

    public Flashcard(String frontContent, String backContent) {
        this.frontContent = frontContent;
        this.backContent = backContent;
    }

    public void markReviewed(boolean isCorrect) {
        if (isCorrect) {
            correctResponses++;
        } else {
            incorrectResponses++;
        }
        this.lastReviewedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Flashcard flashcard)) return false;
        return Objects.equals(userID, flashcard.userID) &&
                Objects.equals(createdAt, flashcard.createdAt) &&
                Objects.equals(frontContent, flashcard.frontContent) &&
                Objects.equals(backContent, flashcard.backContent);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userID, createdAt, frontContent, backContent);
    }
}
