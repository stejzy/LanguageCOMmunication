package org.example.languagecommunication.common.utils;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.example.languagecommunication.common.annotations.NoHtml;

public class NoHtmlValidator implements ConstraintValidator<NoHtml, String> {

    @Override
    public void initialize(NoHtml constraintAnnotation) {

    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return !value.contains("<") && !value.contains(">");
    }
}