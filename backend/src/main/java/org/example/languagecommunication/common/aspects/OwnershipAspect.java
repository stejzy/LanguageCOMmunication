package org.example.languagecommunication.common.aspects;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.example.languagecommunication.common.utils.SecurityUtils;
import org.example.languagecommunication.flashcard.services.FlashcardFolderService;
import org.example.languagecommunication.flashcard.services.FlashcardService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.UUID;


@Aspect
@Component
public class OwnershipAspect {

    private final FlashcardFolderService folderService;
    private final FlashcardService flashcardService;

    public OwnershipAspect(FlashcardFolderService folderService, FlashcardService flashcardService) {
        this.folderService = folderService;
        this.flashcardService = flashcardService;
    }

    @Before("@annotation(org.example.languagecommunication.common.annotations.CheckOwnership)")
    public void checkOwnership(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        Method method = getMethod(joinPoint);

        UUID folderId = null;
        Long flashcardId = null;

        Parameter[] parameters = method.getParameters();
        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].getName().equals("id")) {
                if (args[i] instanceof UUID uuid) {
                    folderId = uuid;
                    break;
                } else if (args[i] instanceof Long longId) {
                    flashcardId = longId;
                    break;
                }
            }
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (folderId != null) {
            Long ownerId = folderService.getFlashcardFolder(folderId).getUserID();
            if (!ownerId.equals(currentUserId)) {
                throw new AccessDeniedException("You don't own this folder");
            }
        } else if (flashcardId != null) {
            Long ownerId = flashcardService.getFlashcard(flashcardId).getUserID();
            if (!ownerId.equals(currentUserId)) {
                throw new AccessDeniedException("You don't own this flashcard");
            }
        } else {
            throw new IllegalArgumentException("No valid ID (UUID or Long) found in method arguments.");
        }
    }

    private Method getMethod(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            Class<?>[] parameterTypes = ((MethodSignature) joinPoint.getSignature()).getMethod().getParameterTypes();
            return joinPoint.getTarget().getClass().getMethod(methodName, parameterTypes);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }
}