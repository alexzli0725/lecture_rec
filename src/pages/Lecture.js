import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const Lecture = () => {
  const { name } = useParams();
  const location = useLocation();
  const content = location.state?.content;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep recording continuously
    recognition.interimResults = true; // Show partial results
    recognition.lang = "en-US"; // Language
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptPart.trim() + ". ");
        } else {
          interimTranscript += transcriptPart;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (isRecording) recognition.start(); // Auto-restart if recording
    };
  }, [isRecording]);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <button>add</button>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          minHeight: "100px",
          whiteSpace: "pre-wrap",
        }}
      >
        {transcript || "Your speech will appear here..."}
      </div>
      {content}
    </div>
  );
};

export default Lecture;

// const SpeechToText = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const recognitionRef = useRef(null);

//   useEffect(() => {
//     // Check browser support
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Your browser does not support Speech Recognition.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true; // Keep recording continuously
//     recognition.interimResults = true; // Show partial results
//     recognition.lang = "en-US"; // Language
//     recognitionRef.current = recognition;

//     recognition.onresult = (event) => {
//       let interimTranscript = "";

//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcriptPart = event.results[i][0].transcript;
//         if (event.results[i].isFinal) {
//           setTranscript((prev) => prev + transcriptPart.trim() + ". ");
//         } else {
//           interimTranscript += transcriptPart;
//         }
//       }
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error:", event.error);
//     };

//     recognition.onend = () => {
//       if (isRecording) recognition.start(); // Auto-restart if recording
//     };
//   }, [isRecording]);

//   const startRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.start();
//       setIsRecording(true);
//     }
//   };

//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>Speech to Text (React)</h1>
//       <button onClick={isRecording ? stopRecording : startRecording}>
//         {isRecording ? "Stop Recording" : "Start Recording"}
//       </button>
//       <div
//         style={{
//           marginTop: "20px",
//           padding: "10px",
//           border: "1px solid #ccc",
//           minHeight: "100px",
//           whiteSpace: "pre-wrap",
//         }}
//       >
//         {transcript || "Your speech will appear here..."}
//       </div>
//     </div>
//   );
// };

// export default SpeechToText;
