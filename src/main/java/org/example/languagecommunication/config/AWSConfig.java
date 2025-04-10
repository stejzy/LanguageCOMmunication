package org.example.languagecommunication.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.translate.TranslateClient;

@Configuration
public class AWSConfig {
    @Bean
    public TranslateClient translateClient() {
        return TranslateClient.builder()
                .region(Region.of("eu-central-1"))
                .build();
    }

    @Bean
    public ComprehendClient comprehendClient() {
        return ComprehendClient.builder()
                .region(Region.of("eu-central-1"))
                .build();
    }

}
