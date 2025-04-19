package org.example.languagecommunication.flashcard.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.languagecommunication.flashcard.models.Flashcard;
import org.example.languagecommunication.flashcard.models.FlashcardFolder;
import org.example.languagecommunication.flashcard.repositories.FlashcardFolderRepository;
import org.example.languagecommunication.flashcard.repositories.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class FlashcardFolderService implements IFlashcardFolderService{
    FlashcardFolderRepository flashcardFolderRepository;
    FlashcardRepository flashcardRepository;

    @Autowired
    public FlashcardFolderService(FlashcardFolderRepository flashcardFolderRepository, FlashcardRepository flashcardRepository) {
        this.flashcardFolderRepository = flashcardFolderRepository;
        this.flashcardRepository = flashcardRepository;
    }

    @Override
    public FlashcardFolder createFlashcardFolder(FlashcardFolder folder) {
        return flashcardFolderRepository.save(folder);
    }

    @Override
    @Transactional
    public FlashcardFolder editFlashcardFolder(UUID id, String newName) {
        FlashcardFolder flashcardFolder = flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));
        flashcardFolder.setName(newName);
        return flashcardFolderRepository.save(flashcardFolder);
    }

    @Override
    @Transactional
    public FlashcardFolder deleteFlashcardFolder(UUID id) {
        FlashcardFolder flashcardFolder = flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));

        for (Flashcard flashcard : new ArrayList<>(flashcardFolder.getFlashcards())) {
            flashcardFolder.removeFlashcard(flashcard);
        }

        flashcardFolderRepository.delete(flashcardFolder);

        return flashcardFolder;
    }

    @Override
    public List<FlashcardFolder> getFlashcardFoldersByUser(Long userId) {
        return flashcardFolderRepository.findByUserID(userId);
    }

    @Override
    public FlashcardFolder getFlashcardFolder(UUID id) {
        return flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));
    }

    // @TODO  sprawdzac czy flashcard z danym id juz istnieje juz w folderze jak jest to error
    @Override
    @Transactional
    public boolean addFlashcardToFolder(UUID id, List<Long> flashcardIds) {
        FlashcardFolder flashcardFolder = flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));

        boolean allAdded = true;
        for (Long flashcardId : flashcardIds) {
            Flashcard flashcard = flashcardRepository.findById(flashcardId)
                    .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + flashcardId + " not found."));

            boolean added = flashcardFolder.addFlashcard(flashcard);
            allAdded &= added;
        }

        return allAdded;
    }

    @Override
    @Transactional
    public boolean removeFlashcardFromFolder(UUID id, List<Long> flashcardIds) {
        FlashcardFolder flashcardFolder = flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));

        boolean allRemoved = true;
        for (Long flashcardId : flashcardIds) {
            Flashcard flashcard = flashcardRepository.findById(flashcardId)
                    .orElseThrow(() -> new EntityNotFoundException("Flashcard with id " + flashcardId + " not found."));

            boolean removed = flashcardFolder.removeFlashcard(flashcard);
            allRemoved &= removed;
        }
        return allRemoved;
    }

    @Override
    public byte[] exportFolderToQR(UUID id) throws WriterException, IOException {
        flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));

        String data = "lancom://flashcardfolder/" + id;
        int width = 300;
        int height = 300;

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(data, BarcodeFormat.QR_CODE, 300, 300, hints);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                image.setRGB(x, y, (bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF));
            }
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }

    @Override
    @Transactional
    public FlashcardFolder importFolder(Long userId, UUID id) {
        FlashcardFolder originalFolder = flashcardFolderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FlashcardFolder with id " + id + " not found."));

        if (originalFolder.getUserID().equals(userId)) {
            throw new IllegalArgumentException("Cannot import your own folder.");
        }

        List<Flashcard> copiedFlashcards = originalFolder.getFlashcards().stream().map(
                flashcard -> {
                    Flashcard newFlashcard = new Flashcard(flashcard.getFrontContent(), flashcard.getBackContent());
                    newFlashcard.setUserID(userId);
                    flashcardRepository.save(newFlashcard);
                    return newFlashcard;
                }
        ).toList();

        FlashcardFolder copiedFolder = new FlashcardFolder(new ArrayList<>(), originalFolder.getName());
        copiedFolder.setUserID(userId);

        for (Flashcard copiedFlashcard : copiedFlashcards) {
            copiedFolder.addFlashcard(copiedFlashcard);
        }

        flashcardFolderRepository.save(copiedFolder);
        return copiedFolder;
    }
}
