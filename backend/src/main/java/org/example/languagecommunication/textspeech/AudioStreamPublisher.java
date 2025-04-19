package org.example.languagecommunication.textspeech;

import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.transcribestreaming.model.AudioEvent;
import software.amazon.awssdk.services.transcribestreaming.model.AudioStream;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AudioStreamPublisher implements Publisher<AudioStream> {
    private final InputStream inputStream;

    public AudioStreamPublisher(InputStream inputStream) {
        this.inputStream = inputStream;
    }

    @Override
    public void subscribe(Subscriber<? super AudioStream> subscriber) {
        subscriber.onSubscribe(new Subscription() {
            private final int CHUNK_SIZE = 1024;
            private final ExecutorService executor = Executors.newSingleThreadExecutor();

            @Override
            public void request(long n) {
                executor.submit(() -> {
                    try {
                        byte[] buffer = new byte[CHUNK_SIZE];
                        int len;
                        while ((len = inputStream.read(buffer)) != -1) {
                            AudioEvent audioEvent = AudioEvent.builder()
                                    .audioChunk(SdkBytes.fromByteArray(Arrays.copyOf(buffer, len)))
                                    .build();
                            subscriber.onNext(audioEvent);
                        }
                        subscriber.onComplete();
                    } catch (IOException e) {
                        subscriber.onError(e);
                    }
                });
            }

            @Override
            public void cancel() {
                executor.shutdownNow();
            }
        });
    }
}

