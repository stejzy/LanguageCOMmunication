package org.example.languagecommunication.flashcard.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"id"})
@NoArgsConstructor
@Entity
@Table(name = "cards")
public class Card implements Serializable {
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userID;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;
    @Column(name = "front_content", nullable = false, updatable = false)
    private String frontContent;
    @Column(name = "back_content", nullable = false, updatable = false)
    private String backContent;
    @Setter
    @Column(name = "status", nullable = false)
    private CardStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "last_reviewed_at", nullable = false)
    private LocalDateTime lastReviewedAt;

    @Column(name = "correct_responses", nullable = false)
    private int correctResponses;
    @Column(name = "incorrect_responses", nullable = false)
    private int incorrectResponses;

    public Card(UUID userID, String frontContent, String backContent) {
        this.userID = userID;
        this.frontContent = frontContent;
        this.backContent = backContent;
        this.status = CardStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.lastReviewedAt = LocalDateTime.MIN;
        this.correctResponses = 0;
        this.incorrectResponses = 0;
    }

    public void markReviewed(boolean isCorrect) {
        this.lastReviewedAt = LocalDateTime.now();
        if (isCorrect) {
            correctResponses++;
        } else {
            incorrectResponses++;
        }
    }
}
