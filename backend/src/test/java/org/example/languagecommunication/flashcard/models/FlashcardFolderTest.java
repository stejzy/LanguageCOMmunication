package org.example.languagecommunication.flashcard.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class FlashcardFolderTest {

    private FlashcardFolder folder;
    private Flashcard flashcard1;
    private Flashcard flashcard2;

    @BeforeEach
    void setUp() {
        flashcard1 = new Flashcard();
        flashcard2 = new Flashcard();
        folder = new FlashcardFolder(new ArrayList<>(), "My Folder");
        folder.setUserID(1L);
    }

    @Test
    void testAddFlashcard_success() {
        boolean result = folder.addFlashcard(flashcard1);

        assertTrue(result, "Flashcard should be added successfully");
        assertEquals(1, folder.getFlashcards().size(), "Folder should contain one flashcard");
        assertTrue(folder.getFlashcards().contains(flashcard1), "Folder should contain the added flashcard");
        assertTrue(flashcard1.getFolders().contains(folder), "Flashcard should reference the folder");
    }

    @Test
    void testAddFlashcard_duplicate() {
        folder.addFlashcard(flashcard1);
        boolean result = folder.addFlashcard(flashcard1);

        assertFalse(result, "Adding the same flashcard again should fail");
        assertEquals(1, folder.getFlashcards().size(), "Flashcard list should not contain duplicates");
    }

    @Test
    void testRemoveFlashcard_success() {
        folder.addFlashcard(flashcard1);
        boolean result = folder.removeFlashcard(flashcard1);

        assertTrue(result, "Flashcard should be removed successfully");
        assertFalse(folder.getFlashcards().contains(flashcard1), "Flashcard should be removed from the folder");
        assertFalse(flashcard1.getFolders().contains(folder), "Folder should be removed from the flashcard");
    }

    @Test
    void testRemoveFlashcard_notFound() {
        boolean result = folder.removeFlashcard(flashcard2);

        assertFalse(result, "Removing a flashcard that is not in the folder should return false");
        assertTrue(folder.getFlashcards().isEmpty(), "Folder should remain empty");
    }
}