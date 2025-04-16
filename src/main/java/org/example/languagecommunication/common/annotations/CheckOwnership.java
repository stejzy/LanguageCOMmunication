package org.example.languagecommunication.common.annotations;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CheckOwnership {
    String folderIdParam() default "id";
}