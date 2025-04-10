package org.example.languagecommunication.flashcard.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class FlashcardTest {

    private Flashcard flashcard;
    private final UUID userID = UUID.randomUUID();
    private final String frontContent = "Front Content";
    private final String backContent = "Back Content";

    @BeforeEach
    void setUp() {
        flashcard = new Flashcard(userID, frontContent, backContent);
    }

    @Test
    void testFlashcardCreation() {
        assertEquals(frontContent, flashcard.getFrontContent());
        assertEquals(backContent, flashcard.getBackContent());
        assertEquals(FlashcardStatus.ACTIVE, flashcard.getStatus());
        assertEquals(0, flashcard.getCorrectResponses());
        assertEquals(0, flashcard.getIncorrectResponses());
        assertNotNull(flashcard.getCreatedAt());
        assertNotNull(flashcard.getLastReviewedAt());
    }

    @Test
    void testMarkReviewedCorrect() throws InterruptedException {
        LocalDateTime beforeReview = flashcard.getLastReviewedAt();
        TimeUnit.MILLISECONDS.sleep(1);
        flashcard.markReviewed(true);

        assertNotEquals(beforeReview, flashcard.getLastReviewedAt());
        assertEquals(1, flashcard.getCorrectResponses());
        assertEquals(0, flashcard.getIncorrectResponses());
    }

    @Test
    void testMarkReviewedIncorrect() throws InterruptedException {
        LocalDateTime beforeReview = flashcard.getLastReviewedAt();
        TimeUnit.MILLISECONDS.sleep(1);
        flashcard.markReviewed(false);

        assertNotEquals(beforeReview, flashcard.getLastReviewedAt());
        assertEquals(0, flashcard.getCorrectResponses());
        assertEquals(1, flashcard.getIncorrectResponses());
    }

    @Test
    void testSetStatus() {
        flashcard.setStatus(FlashcardStatus.LEARNED);
        assertEquals(FlashcardStatus.LEARNED, flashcard.getStatus());
    }

    @Test
    void testConstructor() {
        Flashcard newFlashcard = new Flashcard(userID, "New Front", "New Back");
        assertEquals("New Front", newFlashcard.getFrontContent());
        assertEquals("New Back", newFlashcard.getBackContent());
        assertEquals(FlashcardStatus.ACTIVE, newFlashcard.getStatus());
    }

    @Test
    void testNoNegativeResponses() {
        flashcard.markReviewed(true);
        flashcard.markReviewed(false);
        flashcard.markReviewed(false);

        assertEquals(1, flashcard.getCorrectResponses());
        assertEquals(2, flashcard.getIncorrectResponses());
    }

    @Test
    void testUUID() {
        assertEquals(userID, flashcard.getUserID());
    }
}