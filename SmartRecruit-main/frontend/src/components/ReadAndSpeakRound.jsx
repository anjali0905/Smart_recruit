import React, { useState, useEffect } from 'react';

const ReadAndSpeakRound = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [scores, setScores] = useState([]);
  const [answers, setAnswers] = useState({});
  
  // Validate questions prop
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-4">
            No read and speak questions have been set up for this assessment.
          </p>
          <p className="text-sm text-gray-500">
            Please contact the recruiter or refresh the page.
          </p>
        </div>
      </div>
    );
  }
  
  // Normalize questions - handle both old format (strings) and new format (objects with passage)
  const normalizeQuestion = (q) => {
    if (!q) {
      return { passage: "No passage available", questions: [], instructions: "Read the passage aloud clearly." };
    }
    if (typeof q === 'string') {
      return { passage: q, questions: [], instructions: "Read the passage aloud clearly." };
    }
    if (typeof q === 'object') {
      return {
        passage: q.passage || "No passage available",
        questions: Array.isArray(q.questions) ? q.questions : [],
        instructions: q.instructions || "Read the passage aloud clearly, then answer the comprehension questions based on what you read."
      };
    }
    return { passage: "No passage available", questions: [], instructions: "Read the passage aloud clearly." };
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setSpokenText(transcript);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    setIsListening(true);
    setSpokenText('');
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognition.stop();
    calculateScore();
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
    setAnswers(prev => ({
      ...prev,
      [safeCurrentQuestion]: {
        ...prev[safeCurrentQuestion] || {},
        [questionIndex]: answer
      }
    }));
  };

  const calculateScore = () => {
    // Ensure currentQuestion is within bounds
    const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
    const currentQ = normalizeQuestion(questions[safeCurrentQuestion]);
    const passageWords = currentQ.passage ? currentQ.passage.toLowerCase().split(/\s+/) : [];
    const spokenWords = spokenText.toLowerCase().split(/\s+/);
    
    // Calculate score based on passage reading (pronunciation/fluency)
    let matchedWords = 0;
    passageWords.forEach(word => {
      if (spokenWords.includes(word)) matchedWords++;
    });
    
    const readingScore = passageWords.length > 0 
      ? Math.round((matchedWords / passageWords.length) * 100) 
      : 50;
    
    // Calculate comprehension score if questions exist
    let comprehensionScore = 0;
    if (currentQ.questions && currentQ.questions.length > 0) {
      const answeredQuestions = currentQ.questions.filter((_, idx) => 
        answers[safeCurrentQuestion] && answers[safeCurrentQuestion][idx] && answers[safeCurrentQuestion][idx].trim()
      ).length;
      comprehensionScore = Math.round((answeredQuestions / currentQ.questions.length) * 100);
    }
    
    // Combined score: 60% reading, 40% comprehension (or 100% reading if no questions)
    const finalScore = currentQ.questions && currentQ.questions.length > 0
      ? Math.round(readingScore * 0.6 + comprehensionScore * 0.4)
      : readingScore;
    
    setScores([...scores, finalScore]);

    if (safeCurrentQuestion < questions.length - 1) {
      setCurrentQuestion(safeCurrentQuestion + 1);
      setSpokenText('');
      setAnswers(prev => ({ ...prev, [safeCurrentQuestion]: {} }));
    } else {
      const averageScore = scores.length > 0 
        ? Math.round((scores.reduce((a, b) => a + b, 0) + finalScore) / (scores.length + 1))
        : finalScore;
      onComplete(averageScore);
    }
  };

  // Ensure currentQuestion is within bounds for rendering
  const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
  const currentQ = normalizeQuestion(questions[safeCurrentQuestion] || {});
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Read and Speak - Question {safeCurrentQuestion + 1} of {questions.length}
      </h2>

      {/* Instructions */}
      {currentQ.instructions && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">{currentQ.instructions}</p>
        </div>
      )}

      {/* Passage */}
      <div className="mb-6 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Passage to Read:</h3>
        <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
          {currentQ.passage || 'No passage available'}
        </p>
      </div>

      {/* Comprehension Questions */}
      {currentQ.questions && currentQ.questions.length > 0 && (
        <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehension Questions:</h3>
          <div className="space-y-4">
            {currentQ.questions.map((question, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {idx + 1}. {question}
                </label>
                <textarea
                  value={answers[safeCurrentQuestion]?.[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speech Recording Section */}
      <div className="mb-6 p-6 bg-purple-50 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Read the Passage Aloud:</h3>
        <div className="flex justify-center space-x-4 mb-4">
          {!isListening ? (
            <button
              onClick={startListening}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Recording
            </button>
          )}
        </div>

        {spokenText && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
            <h4 className="font-medium mb-2 text-gray-700">Your recorded speech:</h4>
            <p className="text-gray-700">{spokenText}</p>
          </div>
        )}
      </div>

      {/* Next/Complete Button */}
      <div className="flex justify-end">
        <button
          onClick={calculateScore}
          disabled={isListening}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {safeCurrentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
        </button>
      </div>
    </div>
  );
};

export default ReadAndSpeakRound