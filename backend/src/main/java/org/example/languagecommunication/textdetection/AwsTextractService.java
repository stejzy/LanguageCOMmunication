package org.example.languagecommunication.textdetection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.textract.TextractClient;
import software.amazon.awssdk.services.textract.model.*;

import java.io.InputStream;
import java.util.stream.Collectors;

@Service
public class AwsTextractService {

    private final TextractClient textractClient;

    @Autowired
    public AwsTextractService(TextractClient textractClient) {
        this.textractClient = textractClient;
    }

    public String detectText(InputStream inputStream) {
        SdkBytes bytes = SdkBytes.fromInputStream(inputStream);

        Document document = Document.builder().bytes(bytes).build();

        DetectDocumentTextRequest request = DetectDocumentTextRequest.builder()
                .document(document).build();


        DetectDocumentTextResponse response = textractClient.detectDocumentText(request);

        return response.blocks().stream()
                .filter(block -> block.blockTypeAsString().equals("LINE"))
                .map(Block::text)
                .collect(Collectors.joining("\n"));
    }
}
