package org.example.languagecommunication.auth.exceptions;

public class MailSendFailedException extends RuntimeException {
    public MailSendFailedException(String message) {
        super(message);
    }
}
