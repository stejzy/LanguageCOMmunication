import { createContext, useContext, useState } from "react";

const RecordingContext = createContext();

export const RecordingProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => useContext(RecordingContext);
