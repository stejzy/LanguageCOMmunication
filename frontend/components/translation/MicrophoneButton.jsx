import { Pressable, StyleSheet, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import { AuthContext } from "@/context/AuthContext";
import AudioRecord from "react-native-audio-record";
import { Buffer } from "buffer";
import { PermissionsAndroid } from "react-native";

global.Buffer = Buffer;

export default function MicrophoneButton({ isRecording, setIsRecording }) {
  const { sourceLanguage, setTextToTranslate, setTranslatedText } =
    useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { authState } = useContext(AuthContext);

  const [disableMic, setDisableMic] = useState(true);

  const styles = createStyles(theme, disableMic);

  useEffect(() => {
    if (authState.authenticated && sourceLanguage) {
      setDisableMic(sourceLanguage.transcribeLangCode === "none");
    }
  }, [authState.authenticated, sourceLanguage]);

  const toggleRecording = async () => {
    if (isRecording) {
      await stopTranscription();
      setIsRecording(false);
    } else {
      setTextToTranslate("");
      setTranslatedText("");
      startTranscription();
      setIsRecording(true);
    }
  };

  //Do wersji webowej
  const socket = useRef(null);
  const micStream = useRef(null);
  const audioContext = useRef(null);
  const workletNode = useRef(null);

  const startAudioStream = () => {
    console.log("Starting audio stream...");

    audioContext.current = new AudioContext({ sampleRate: 16000 });
    audioContext.current.resume();

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        micStream.current = stream;

        const source = audioContext.current.createMediaStreamSource(stream);
        setupAudioWorklet(source);
      })
      .catch((error) => {
        console.error("getUserMedia error:", error);
      });
  };

  const setupAudioWorklet = (source) => {
    const workletCode = `
          class PCMWorklet extends AudioWorkletProcessor {
              process(inputs) {
                  const input = inputs[0][0];
                  if (input) {
                      const int16 = new Int16Array(input.length);
                      input.forEach((v, i) => {
                          int16[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
                      });
                      this.port.postMessage(int16.buffer, [int16.buffer]);
                  }
                  return true;
              }
          }
          registerProcessor("pcm-worklet", PCMWorklet);
      `;

    const blob = new Blob([workletCode], { type: "application/javascript" });
    const moduleURL = URL.createObjectURL(blob);

    audioContext.current.audioWorklet
      .addModule(moduleURL)
      .then(() => {
        workletNode.current = new AudioWorkletNode(
          audioContext.current,
          "pcm-worklet"
        );

        workletNode.current.port.onmessage = (e) => {
          if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(e.data);
            console.log("Sending data websocket");
          }
        };

        source
          .connect(workletNode.current)
          .connect(audioContext.current.destination);
      })
      .catch((error) => console.error("❌ Worklet error:", error));
  };

  const startTranscriptionWeb = () => {
    try {
      const transcribeLangCode = sourceLanguage?.transcribeLangCode || "none";
      console.log("Siema:");
      console.log(transcribeLangCode);
      socket.current = new WebSocket(
        `wss://api.flashlingo.app/ws/transcription?transcribeLangCode=${
          sourceLanguage?.transcribeLangCode || "none"
        }`
      );

      socket.current.binaryType = "arraybuffer";

      socket.current.onopen = () => {
        console.log("WebSocket connected.");
        startAudioStream();
      };

      socket.current.onmessage = (event) => {
        console.log(`Received: ${event.data}`);
        setTextToTranslate((prev) => prev + " " + event.data);
      };

      socket.current.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      socket.current.onclose = () => {
        console.log("WebSocket closed.");
      };
    } catch (error) {
      console.error("Error starting transcription:", error);
    }
  };

  const stopTranscriptionWeb = async () => {
    if (workletNode.current) {
      workletNode.current.disconnect();
      workletNode.current.port.postMessage("stop");
    }

    if (audioContext.current && audioContext.current.state !== "closed") {
      await audioContext.current.close();
    }

    if (micStream.current) {
      micStream.current.getTracks().forEach((track) => track.stop());
    }

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.close();
    }

    socket.current = null;
    micStream.current = null;
    audioContext.current = null;
    workletNode.current = null;
  };

  //Koniec wersji webowej
  //--------------------------------------

  //Do wersji mobilnej

  const startTranscriptionMobile = async () => {
    console.log("Start mobilki");

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message:
          "This app needs access to your microphone to transcribe speech.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Microphone permission denied");
      return;
    }

    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "test.wav",
    });

    socket.current = new WebSocket(
      `wss://api.flashlingo.app/ws/transcription?transcribeLangCode=${
        sourceLanguage?.transcribeLangCode || "none"
      }`
    );
    socket.current.binaryType = "arraybuffer";

    socket.current.onopen = () => {
      console.log("WebSocket connected");
      AudioRecord.start();

      const currentSocket = socket.current;

      AudioRecord.on("data", (data) => {
        const buffer = Buffer.from(data, "base64");

        if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.send(buffer);
        }
      });
    };

    socket.current.onmessage = (e) => {
      console.log("Received:", e.data);
      setTextToTranslate((prev) => prev + " " + e.data);
    };

    socket.current.onerror = (e) => console.error("WebSocket error:", e);
    socket.current.onclose = () => console.log("WebSocket closed");
  };

  const stopTranscriptionMobile = () => {
    console.log("Stop mobilki");

    AudioRecord.stop();

    if (socket.current) {
      console.log("Socket state:", socket.current.readyState);
      if (socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
    } else {
      console.log("Socket was null during stop");
    }

    socket.current = null;
  };

  //Koniec wersji mobilnej
  //--------------------------------------

  const startTranscription = () => {
    if (Platform.OS === "web") {
      startTranscriptionWeb();
    } else {
      startTranscriptionMobile();
    }
  };

  const stopTranscription = async () => {
    if (Platform.OS === "web") {
      await stopTranscriptionWeb();
    } else {
      stopTranscriptionMobile();
    }
  };

  return (
    <Pressable
      style={styles.micButton}
      onPress={toggleRecording}
      disabled={disableMic}
    >
      <FontAwesome
        name={isRecording ? "stop" : "microphone"}
        size={isRecording ? 26 : 30}
        color={theme.text}
      />
    </Pressable>
  );
}

function createStyles(theme, disableMic) {
  return StyleSheet.create({
    micButton: {
      backgroundColor: disableMic ? theme.disable : theme.torq,
      opacity: disableMic ? 0.9 : 1,
      height: 75,
      width: 75,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.5,
      shadowRadius: 7,

      elevation: 5,
    },
  });
}
