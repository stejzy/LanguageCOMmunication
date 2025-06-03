package org.example.languagecommunication.translation.awstranslation.service;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.auth.repository.UserRepository;
import org.example.languagecommunication.common.utils.SecurityUtils;
import org.example.languagecommunication.exception.TranslationException;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.example.languagecommunication.translation.awstranslation.DTO.TranslationDTO;
import org.example.languagecommunication.translation.awstranslation.repository.TranslationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TranslationHistoryService {

    private final TranslationRepository translationRepository;
    private final UserRepository userRepository;

    public TranslationHistoryService(TranslationRepository translationRepository, UserRepository userRepository) {
        this.translationRepository = translationRepository;
        this.userRepository = userRepository;
    }

    public Translation saveSuccess(String sourceText, String translatedText, String sourceLang, String targetLang) {
        Translation translation = new Translation();
        translation.setSourceText(sourceText);
        translation.setTranslatedText(translatedText);
        translation.setSourceLanguage(sourceLang);
        translation.setTargetLanguage(targetLang);
        translation.setTimestamp(LocalDateTime.now());
        translation.setSuccess(true);

        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        translation.setUser(user);

        return translationRepository.save(translation);
    }

    public Translation saveError(String sourceText, String sourceLang, String targetLang, String errorMessage) {
        Translation translation = new Translation();
        translation.setSourceText(sourceText);
        translation.setSourceLanguage(sourceLang);
        translation.setTargetLanguage(targetLang);
        translation.setTimestamp(LocalDateTime.now());
        translation.setSuccess(false);
        translation.setErrorMessage(errorMessage);

        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        translation.setUser(user);

        return translationRepository.save(translation);
    }


    public List<TranslationDTO> getAllTranslations() {
        Long userId = SecurityUtils.getCurrentUserId();
        return translationRepository.findByUserId(userId)
                .stream()
                .map(t -> new TranslationDTO(
                        t.getId(),
                        t.getSourceText(),
                        t.getTranslatedText(),
                        t.getSourceLanguage(),
                        t.getTargetLanguage(),
                        t.isSuccess(),
                        t.getErrorMessage(),
                        t.getTimestamp()
                ))
                .toList();
    }


    public List<TranslationDTO> getSuccessfulTranslations() {
        Long userId = SecurityUtils.getCurrentUserId();
        return translationRepository.findByUserIdAndSuccessTrue(userId)
                .stream()
                .map(t -> new TranslationDTO(
                        t.getId(),
                        t.getSourceText(),
                        t.getTranslatedText(),
                        t.getSourceLanguage(),
                        t.getTargetLanguage(),
                        t.isSuccess(),
                        t.getErrorMessage(),
                        t.getTimestamp()
                ))
                .toList();
    }

    public void deleteTranslationById(Long id) {
        Translation translation = translationRepository.findById(id)
                .orElseThrow(() -> new TranslationException("Translation with id " + id + " not found", HttpStatus.NOT_FOUND));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (translation.getUser() == null || !translation.getUser().getId().equals(currentUserId)) {
            throw new TranslationException("You do not own this translation", HttpStatus.FORBIDDEN);
        }

        translationRepository.deleteById(id);
    }

}

