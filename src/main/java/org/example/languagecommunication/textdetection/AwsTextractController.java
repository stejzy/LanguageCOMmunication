package org.example.languagecommunication.textdetection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Controller
public class AwsTextractController {
    private final AwsTextractService awsTextractService;

    @Autowired
    public AwsTextractController(AwsTextractService awsTextractService) {
        this.awsTextractService = awsTextractService;
    }

    @PostMapping("/detectText")
    public ResponseEntity<String> detectText(@RequestParam("file") MultipartFile file) throws IOException {
        try (InputStream inputStream  = file.getInputStream()) {
            String detectedText = awsTextractService.detectText(inputStream);
            return ResponseEntity.ok(detectedText);
        }
    }
}
