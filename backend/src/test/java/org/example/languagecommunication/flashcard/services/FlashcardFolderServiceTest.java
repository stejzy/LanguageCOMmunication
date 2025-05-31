package org.example.languagecommunication.flashcard.services;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import jakarta.persistence.EntityNotFoundException;

import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.repositories.FlashcardFolderRepository;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashcardFolderServiceTest {

    @Mock
    private FlashcardFolderRepository flashcardFolderRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @InjectMocks
    private FlashcardFolderService flashcardFolderService;

    private FlashcardFolder folder;
    private Flashcard flashcard;
    private final List<Long> flashcardIds = List.of(1L);
    private final UUID folderId = UUID.fromString("d8fc0396-03dd-4628-8d10-9c8ecaca6377");

    @BeforeEach
    void setUp() {
        folder = new FlashcardFolder(new ArrayList<>(), "Test Folder");
        folder.setUserID(1L);
        flashcard = new Flashcard();
    }

    @Test
    public void testCreateFlashcardFolder() {
        when(flashcardFolderRepository.save(any(FlashcardFolder.class))).thenReturn(folder);
        FlashcardFolder created = flashcardFolderService.createFlashcardFolder(folder);
        assertNotNull(created);
        verify(flashcardFolderRepository, times(1)).save(folder);
    }

    @Test
    public void testEditFlashcardFolder() {
        folder.setName("Old Name");
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.of(folder));
        when(flashcardFolderRepository.save(any(FlashcardFolder.class))).thenReturn(folder);

        FlashcardFolder updated = flashcardFolderService.editFlashcardFolder(folderId, "New Name");
        assertEquals("New Name", updated.getName());
        verify(flashcardFolderRepository, times(1)).findById(folderId);
        verify(flashcardFolderRepository, times(1)).save(folder);
    }

    @Test
    public void testDeleteFlashcardFolder() {
        folder.getFlashcards().add(flashcard);
        flashcard.getFolders().add(folder);
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.of(folder));

        FlashcardFolder folder = flashcardFolderService.deleteFlashcardFolder(folderId);
        verify(flashcardFolderRepository, times(1)).delete(folder);
        assertFalse(flashcard.getFolders().contains(folder));
    }

    @Test
    public void testGetFlashcardFoldersByUser() {
        Long userId = folder.getUserID();
        List<FlashcardFolder> folderList = new ArrayList<>();
        folderList.add(folder);
        when(flashcardFolderRepository.findByUserID(userId)).thenReturn(folderList);

        List<FlashcardFolder> result = flashcardFolderService.getFlashcardFoldersByUser(userId);
        assertEquals(1, result.size());
        assertEquals(folder, result.getFirst());
    }

    @Test
    public void testGetFlashcardFolder() {
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.of(folder));
        FlashcardFolder found = flashcardFolderService.getFlashcardFolder(folderId);
        assertNotNull(found);
        verify(flashcardFolderRepository, times(1)).findById(folderId);
    }

    @Test
    public void testAddFlashcardToFolder() {
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.of(folder));
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));

        assertTrue(flashcardFolderService.addFlashcardToFolder(folderId, flashcardIds));
        assertTrue(folder.getFlashcards().contains(flashcard));
        assertTrue(flashcard.getFolders().contains(folder));
    }

    @Test
    public void testRemoveFlashcardFromFolder() {
        folder.getFlashcards().add(flashcard);
        flashcard.getFolders().add(folder);
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.of(folder));
        when(flashcardRepository.findById(1L)).thenReturn(Optional.of(flashcard));

        assertTrue(flashcardFolderService.removeFlashcardFromFolder(folderId, flashcardIds));
        assertFalse(folder.getFlashcards().contains(flashcard));
        assertFalse(flashcard.getFolders().contains(folder));
    }

    @Test
    public void testGetFlashcardFolderNotFound() {
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> flashcardFolderService.getFlashcardFolder(folderId));
    }

    @Test
    void testExportFolderToQR() throws IOException, WriterException, ChecksumException, NotFoundException, FormatException {
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.ofNullable(folder));
        byte[] qrCodeBytes = flashcardFolderService.exportFolderToQR(folderId);

        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(qrCodeBytes);
        BufferedImage qrCodeImage = ImageIO.read(byteArrayInputStream);

        QRCodeReader qrCodeReader = new QRCodeReader();

        LuminanceSource source = new BufferedImageLuminanceSource(qrCodeImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = qrCodeReader.decode(bitmap);
        String qrCodeText = result.getText();

        assertEquals("lancom://flashcardfolder/" + folderId, qrCodeText, "QR Code content doesn't match the expected UUID");
    }

    @Test
    void testImportFolderSuccessfully() {
        Long originalUserId = 1L;
        Long importingUserId = 2L;
        UUID originalFolderId = UUID.randomUUID();

        Flashcard originalCard1 = new Flashcard("Front 1", "Back 1");
        originalCard1.setUserID(originalUserId);
        Flashcard originalCard2 = new Flashcard("Front 2", "Back 2");
        originalCard2.setUserID(originalUserId);
        List<Flashcard> originalFlashcards = List.of(originalCard1, originalCard2);

        FlashcardFolder originalFolder = new FlashcardFolder(new ArrayList<>(originalFlashcards), "Original Folder");
        originalFolder.setUserID(originalUserId);

        when(flashcardFolderRepository.findById(originalFolderId)).thenReturn(Optional.of(originalFolder));

        FlashcardFolder importedFolder = flashcardFolderService.importFolder(importingUserId, originalFolderId);

        assertNotNull(importedFolder);
        assertEquals(importingUserId, importedFolder.getUserID());
        assertEquals("Original Folder", importedFolder.getName());
        assertEquals(2, importedFolder.getFlashcards().size());
        assertNotEquals(importedFolder.getUserID(), originalFolder.getUserID());

        for (Flashcard card : importedFolder.getFlashcards()) {
            assertEquals(importingUserId, card.getUserID());
        }

        verify(flashcardFolderRepository).findById(originalFolderId);
    }

    @Test
    void testImportFolderNotFoundThrowsException() {
        Long userId = 1L;
        when(flashcardFolderRepository.findById(folderId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> flashcardFolderService.importFolder(userId, folderId));
    }
}