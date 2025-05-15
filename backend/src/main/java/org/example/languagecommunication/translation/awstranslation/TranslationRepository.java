package org.example.languagecommunication.translation.awstranslation;

import org.example.languagecommunication.translation.awstranslation.DTO.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findByUserId(Long userId);

    List<Translation> findByUserIdAndSuccessTrue(Long userId);
}
