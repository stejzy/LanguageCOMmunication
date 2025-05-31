package org.example.languagecommunication.common.annotations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import org.example.languagecommunication.common.utils.NoHtmlValidator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoHtmlValidator.class)
public @interface NoHtml {
    String message() default "Field cannot contain HTML elements";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}