import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { BACKEND_URL } from "../config";

const HRFacialAnalysis = ({ candidateEmail, userId, onAnalysisComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopVideo();
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      console.log("Face-api models loaded successfully");
    } catch (error) {
      console.error("Error loading face-api models:", error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Unable to access webcam. Please grant camera permissions.");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startAnalysis = async () => {
    if (!modelsLoaded) {
      alert("Models are still loading. Please wait.");
      return;
    }

    await startVideo();
    setIsAnalyzing(true);
    startTimeRef.current = Date.now();
    setEmotionData([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const updateDetections = async () => {
      if (!video || video.readyState !== 4) return;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );
          const confidence = expressions[dominantEmotion];

          const emotionEntry = {
            emotion: dominantEmotion,
            confidence: Math.round(confidence * 100),
            timestamp: new Date(),
          };

          setEmotionData((prev) => [...prev, emotionEntry]);
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    };

    intervalRef.current = setInterval(updateDetections, 2000); // Analyze every 2 seconds
  };

  const stopAnalysis = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnalyzing(false);
    stopVideo();

    // Calculate analysis results
    if (emotionData.length > 0) {
      const averageConfidence =
        emotionData.reduce((sum, entry) => sum + entry.confidence, 0) /
        emotionData.length;

      const emotionCounts = {};
      emotionData.forEach((entry) => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      });

      const dominantEmotions = Object.keys(emotionCounts)
        .sort((a, b) => emotionCounts[b] - emotionCounts[a])
        .slice(0, 3);

      // Calculate communication clarity based on positive emotions
      const positiveEmotions = ["happy", "neutral", "surprised"];
      const positiveCount = emotionData.filter((entry) =>
        positiveEmotions.includes(entry.emotion)
      ).length;
      const communicationClarity = Math.round(
        (positiveCount / emotionData.length) * 100
      );

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        averageConfidence * 0.4 + communicationClarity * 0.6
      );

      // Send analysis to backend
      try {
        await axios.post(`${BACKEND_URL}/addHRInterviewAnalysis`, {
          userId,
          candidateEmail,
          emotionData,
          averageConfidence: Math.round(averageConfidence),
          dominantEmotions,
          communicationClarity,
          overallScore,
        });

        // Also update the score
        await axios.post(`${BACKEND_URL}/addScore`, {
          userId,
          candidateEmail,
          roundName: "hr",
          score: overallScore,
        });

        if (onAnalysisComplete) {
          onAnalysisComplete({
            averageConfidence: Math.round(averageConfidence),
            dominantEmotions,
            communicationClarity,
            overallScore,
          });
        }

        alert(
          `Analysis complete! Overall HR Score: ${overallScore}/100\nDominant Emotions: ${dominantEmotions.join(", ")}`
        );
      } catch (error) {
        console.error("Error saving HR interview analysis:", error);
        alert("Error saving analysis. Please try again.");
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 z-50 max-w-sm">
      <h3 className="text-lg font-semibold mb-2">HR Interview Analysis</h3>
      <div className="mb-3">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full rounded border-2 border-gray-300"
          style={{ display: isAnalyzing ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          className="w-full rounded border-2 border-gray-300"
          style={{ display: isAnalyzing ? "block" : "none" }}
        />
      </div>
      <div className="flex gap-2">
        {!isAnalyzing ? (
          <button
            onClick={startAnalysis}
            disabled={!modelsLoaded}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {modelsLoaded ? "Start Analysis" : "Loading Models..."}
          </button>
        ) : (
          <button
            onClick={stopAnalysis}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop Analysis
          </button>
        )}
      </div>
      {emotionData.length > 0 && (
        <div className="mt-2 text-sm">
          <p>Emotions detected: {emotionData.length}</p>
          {emotionData.length > 0 && (
            <p className="text-xs text-gray-600">
              Latest: {emotionData[emotionData.length - 1].emotion} (
              {emotionData[emotionData.length - 1].confidence}%)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HRFacialAnalysis;


