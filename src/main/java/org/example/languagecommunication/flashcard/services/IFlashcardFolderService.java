package org.example.languagecommunication.flashcard.services;

import com.google.zxing.WriterException;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface IFlashcardFolderService {
    FlashcardFolder createFlashcardFolder(FlashcardFolder folder);
    FlashcardFolder editFlashcardFolder(UUID id, String newName);
    FlashcardFolder deleteFlashcardFolder(UUID id);
    List<FlashcardFolder> getFlashcardFoldersByUser(UUID userId);
    FlashcardFolder getFlashcardFolder(UUID id);
    boolean addFlashcardToFolder(UUID id, List<Long> flashcardIds);
    boolean removeFlashcardFromFolder(UUID id, List<Long> flashcardIds);
    byte[] exportFolderToQR(UUID id) throws WriterException, IOException;
    FlashcardFolder importFolder(UUID userId, UUID id);
}
