package org.example.languagecommunication.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
public class OpenApiController {

    @GetMapping(value = "/openapi.yaml")
    public ResponseEntity<String> getOpenApiSpec() throws IOException {
        ClassPathResource resource = new ClassPathResource("openapi.yaml");
        String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("application/vnd.oai.openapi"))
                .body(content);
    }

    @GetMapping(value = "/redoc", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRedocUI() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Flashlingo API Documentation</title>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    </style>
                </head>
                <body>
                    <redoc spec-url='/openapi.yaml'></redoc>
                    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
                </body>
                </html>
                """;
        return ResponseEntity.ok(html);
    }
} 