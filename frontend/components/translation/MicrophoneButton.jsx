import { Pressable, StyleSheet, Platform} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";


export default function MicrophoneButton({ isRecording, setIsRecording}) {
    const {sourceLanguage, setSourceLanguage, textToTranslate,  setTextToTranslate, translatedText, setTranslatedText} = useContext(LanguageContext);
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    const toggleRecording = () => {
        setIsRecording((prev) => {
          if (prev) {
            stopTranscription();
          } else {
            setTextToTranslate("");
            setTranslatedText("");
            startTranscription();
          }
          return !prev;
        });
      };

    //Do wersji webowej
    let socket, micStream, audioContext, workletNode;

    const startAudioStream = () => {
        console.log("Starting audio stream...");

        audioContext = new AudioContext({sampleRate: 16000});
        audioContext.resume(); 

        navigator.mediaDevices.getUserMedia({audio: true})
            .then((stream) => {
                micStream = stream;
                const source = audioContext.createMediaStreamSource(stream);
                setupAudioWorklet(source);
            }).catch(error => {
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
    
        audioContext.audioWorklet.addModule(moduleURL)
          .then(() => {
            workletNode = new AudioWorkletNode(audioContext, "pcm-worklet");
            workletNode.port.onmessage = (e) => {
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(e.data);
              }
            };
            source.connect(workletNode).connect(audioContext.destination);
          })
          .catch((error) => console.error("❌ Worklet error:", error));
    };



    //Koniec wersji webowej
    //--------------------------------------
    

    //Do wersji mobilnej


    //Koniec wersji mobilnej
    //--------------------------------------

    const startTranscription = () => {
        if (Platform.OS === "web"){
            try{
                socket = new WebSocket("ws://localhost:8080/ws/transcription");
                socket.binaryType = "arraybuffer";

                socket.onopen = () => {
                    console.log("WebSocket connected.");
                    startAudioStream();
                };
        
                socket.onmessage = (event) => {
                    console.log(`Received: ${event.data}`);
                    setTextToTranslate(prev => prev + event.data);
                };
        
                socket.onerror = (err) => {
                    console.error("WebSocket error:", err);
                };
        
                socket.onclose = () => {
                    console.log("WebSocket closed.");
                };


            }catch(error){
                console.error("Error starting transcription:", error);
            }
        } else {

        }
    };

    

    const stopTranscription = async () => {
        if (Platform.OS === "web"){
            if (workletNode) {
                workletNode.disconnect();
                workletNode.port.postMessage("stop");
              }
        
              if (audioContext && audioContext.state !== "closed") {
                await audioContext.close();
              }
        
              if (micStream) {
                micStream.getTracks().forEach((track) => track.stop());
              }
        
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
              }
        
              socket = null;
              micStream = null;
              audioContext = null;
              workletNode = null;
        } else {
            
        }
    };



    return(
        <Pressable style={styles.micButton} onPress={toggleRecording}>
            <FontAwesome
                name="microphone"
                size={30}
                color={theme.d_gray}
            />
        </Pressable>
    );

    
}

function createStyles(theme){
    return StyleSheet.create({
        micButton: {
            backgroundColor: theme.mint,
            height: 75,
            width: 75,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center"
        },
    });
}