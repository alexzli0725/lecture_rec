import axios from "axios";
import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const Lecture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);

  const location = useLocation();
  const content = location.state?.content;
  const id = location.state?.id;

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  console.log(id);

  // 🎙️ Start recording
  const handleStartRecording = async () => {
    setError("");
    setTranscript("");
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);

        // stop mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or unavailable");
    }
  };

  // ⏹️ Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const API_URL = "http://localhost:8000";
  // 🧠 Transcribe
  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError("No audio recorded");
      return;
    }

    setIsTranscribing(true);
    setError("");
    setTranscript("");

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");

    try {
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data.text || "");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transcription failed";
      setError(message);
      console.error("Transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setTranscript("");
    setError("");
  };

  const addTranscription = async () => {
    try {
      const response = await fetch(`${API_URL}/lecture/${id}/append`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      setTranscript(data.content || "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add failed";
      setError(message);
      console.error("Add error:", err);
    }
  };

  return (
    <div>
      <header className="App-header">
        <h2>Voice Transcription</h2>

        {!isRecording ? (
          <button onClick={handleStartRecording}>🎙️ Start Recording</button>
        ) : (
          <button onClick={handleStopRecording}>⏹️ Stop Recording</button>
        )}

        <button
          onClick={handleTranscribe}
          disabled={!audioBlob || isTranscribing}
        >
          {isTranscribing ? "Transcribing..." : "🧠 Transcribe"}
        </button>

        <button onClick={handleReset}>🔄 Reset</button>

        {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} />}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <h3>Transcript</h3>
        {transcript && (
          <>
            <p>{transcript}</p>
          </>
        )}
        <button onClick={addTranscription}>add script</button>
      </header>
    </div>
  );
};

export default Lecture;
