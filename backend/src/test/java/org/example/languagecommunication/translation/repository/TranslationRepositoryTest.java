package org.example.languagecommunication.translation.repository;

import org.example.languagecommunication.auth.model.User;
import org.example.languagecommunication.translation.awstranslation.model.Translation;
import org.example.languagecommunication.translation.awstranslation.repository.TranslationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class TranslationRepositoryTest {

    @Autowired
    TranslationRepository translationRepository;

    @Autowired
    TestEntityManager testEntityManager;

    private User user;

    @BeforeEach
    public void setUp(){
        user = new User("test_user", "test@example.com", "password123");
        user.setEnabled(true);
        testEntityManager.persist(user);
    }

    @Test
    public void save_shouldReturnTranslation(){
        Translation translation = Translation.builder()
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user)
                .build();

        Translation saved = translationRepository.save(translation);

        assertNotNull(saved.getId());
        assertEquals("Cześć", saved.getTranslatedText());
        assertEquals("test_user", saved.getUser().getUsername());

        Translation failedTranslation = Translation.builder()
                .sourceText("Bonjour")
                .translatedText(null)
                .sourceLanguage("fr")
                .targetLanguage("xx") // np. nieistniejący język
                .timestamp(LocalDateTime.now())
                .success(false)
                .errorMessage("Unsupported target language")
                .user(user)
                .build();

        Translation savedFailed = translationRepository.save(failedTranslation);

        assertNotNull(savedFailed.getId());
        assertFalse(savedFailed.isSuccess());
        assertNull(savedFailed.getTranslatedText());
        assertEquals("Unsupported target language", savedFailed.getErrorMessage());
    }

    @Test
    public void findByUserId_shouldReturnListOfUserTranslations(){
        User user2 = new User("test_user2", "test2@example.com", "password123");
        user2.setEnabled(true);
        testEntityManager.persist(user2);

        // Two translations for user (created in setUp method)
        Translation translation1 = Translation.builder()
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user)
                .build();
        translationRepository.save(translation1);

        Translation translation2 = Translation.builder()
                .sourceText("Goodbye")
                .translatedText("Do widzenia")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user)
                .build();
        translationRepository.save(translation2);

        // One translation for user2
        Translation translation3 = Translation.builder()
                .sourceText("Bonjour")
                .translatedText("Cześć")
                .sourceLanguage("fr")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user2)
                .build();
        translationRepository.save(translation3);


        //Tests for user
        List<Translation> userTranslations = translationRepository.findByUserId(user.getId());

        assertEquals(2, userTranslations.size());
        assertTrue(userTranslations.stream().allMatch(t -> t.getUser().getId().equals(user.getId())));

        //Test for user2
        List<Translation> user2Translations = translationRepository.findByUserId(user2.getId());
        assertTrue(user2Translations.stream().allMatch(t -> t.getUser().getId().equals(user2.getId())));

    }

    @Test
    public void findByUserIdAndSuccessTrue_shouldReturnOnlySuccessfulUserTranslations() {
        User user2 = new User("test_user2", "test2@example.com", "password123");
        user2.setEnabled(true);
        testEntityManager.persist(user2);

        // One successfull and one unsuccessfull translation for user2
        Translation translation1 = Translation.builder()
                .sourceText("Hello")
                .translatedText("Cześć")
                .sourceLanguage("en")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)  // sukces
                .errorMessage(null)
                .user(user)
                .build();
        translationRepository.save(translation1);

        Translation translationFail = Translation.builder()
                .sourceText("ErrorText")
                .translatedText(null)
                .sourceLanguage("en")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(false)  // porażka
                .errorMessage("Some error")
                .user(user)
                .build();
        translationRepository.save(translationFail);

        // Two successfull translations for user2
        Translation translation2 = Translation.builder()
                .sourceText("Bonjour")
                .translatedText("Cześć")
                .sourceLanguage("fr")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user2)
                .build();
        translationRepository.save(translation2);

        Translation translation3 = Translation.builder()
                .sourceText("Merci")
                .translatedText("Dziękuję")
                .sourceLanguage("fr")
                .targetLanguage("pl")
                .timestamp(LocalDateTime.now())
                .success(true)
                .errorMessage(null)
                .user(user2)
                .build();
        translationRepository.save(translation3);

        // Tests for user
        List<Translation> userSuccessTranslations = translationRepository.findByUserIdAndSuccessTrue(user.getId());

        assertEquals(1, userSuccessTranslations.size());
        assertTrue(userSuccessTranslations.stream().allMatch(t -> t.getUser().getId().equals(user.getId())));
        assertTrue(userSuccessTranslations.stream().allMatch(Translation::isSuccess));

        // Tests for user2
        List<Translation> user2SuccessTranslations = translationRepository.findByUserIdAndSuccessTrue(user2.getId());

        assertEquals(2, user2SuccessTranslations.size());
        assertTrue(user2SuccessTranslations.stream().allMatch(t -> t.getUser().getId().equals(user2.getId())));
        assertTrue(user2SuccessTranslations.stream().allMatch(Translation::isSuccess));
    }


}
