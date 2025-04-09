package org.example.languagecommunication.flashcard.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CardTest {

    private Card card;
    private final UUID userID = UUID.randomUUID();
    private final String frontContent = "Front Content";
    private final String backContent = "Back Content";

    @BeforeEach
    void setUp() {
        card = new Card(userID, frontContent, backContent);
    }

    @Test
    void testCardCreation() {
        assertEquals(frontContent, card.getFrontContent());
        assertEquals(backContent, card.getBackContent());
        assertEquals(CardStatus.ACTIVE, card.getStatus());
        assertEquals(0, card.getCorrectResponses());
        assertEquals(0, card.getIncorrectResponses());
        assertNotNull(card.getCreatedAt());
        assertEquals(LocalDateTime.MIN, card.getLastReviewedAt());
    }

    @Test
    void testMarkReviewedCorrect() {
        LocalDateTime beforeReview = card.getLastReviewedAt();
        card.markReviewed(true);

        assertNotEquals(beforeReview, card.getLastReviewedAt());
        assertEquals(1, card.getCorrectResponses());
        assertEquals(0, card.getIncorrectResponses());
    }

    @Test
    void testMarkReviewedIncorrect() {
        LocalDateTime beforeReview = card.getLastReviewedAt();
        card.markReviewed(false);

        assertNotEquals(beforeReview, card.getLastReviewedAt());
        assertEquals(0, card.getCorrectResponses());
        assertEquals(1, card.getIncorrectResponses());
    }

    @Test
    void testSetStatus() {
        card.setStatus(CardStatus.LEARNED);
        assertEquals(CardStatus.LEARNED, card.getStatus());
    }

    @Test
    void testConstructor() {
        Card newCard = new Card(userID, "New Front", "New Back");
        assertEquals("New Front", newCard.getFrontContent());
        assertEquals("New Back", newCard.getBackContent());
        assertEquals(CardStatus.ACTIVE, newCard.getStatus());
    }

    @Test
    void testNoNegativeResponses() {
        card.markReviewed(true);
        card.markReviewed(false);
        card.markReviewed(false);

        assertEquals(1, card.getCorrectResponses());
        assertEquals(2, card.getIncorrectResponses());
    }

    @Test
    void testUUID() {
        assertEquals(userID, card.getUserID());
    }
}