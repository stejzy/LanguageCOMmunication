package org.example.languagecommunication.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.example.languagecommunication.common.annotations.NoHtml;

@Data
public class RegisterDTO {
    @NotBlank
    @NoHtml
    private String username;

    @NotBlank
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank
    private String password;
}
