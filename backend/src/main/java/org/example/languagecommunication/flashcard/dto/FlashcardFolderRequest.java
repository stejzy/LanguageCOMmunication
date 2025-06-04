package org.example.languagecommunication.flashcard.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.languagecommunication.common.annotations.NoHtml;
import org.example.languagecommunication.flashcard.models.Flashcard;

import java.util.List;

@Getter
@Setter
public class FlashcardFolderRequest {
    @NoHtml
    private String name;

    private List<Flashcard> flashcards;
} 