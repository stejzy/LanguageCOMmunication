package org.example.languagecommunication.flashcard.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FlashcardRequest {
    private List<Long> flashcardIds;
}