import { useState, useEffect } from "react";
import {
  Play,
  AlertCircle,
  Sun,
  Clock,
  Moon,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import sendHREmail from "../components/HRemail";
import { BACKEND_URL, FRONTEND_URL } from "../config";

// Configuration constants
const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  javascript: "18.15.0",
  java: "15.0.2",
  cpp: "10.2.0",
  c: "10.2.0",
  go: "1.16.2",
  ruby: "3.0.1",
  rust: "1.68.2",
  php: "8.2.3",
};

// API setup
const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [{ content: sourceCode }],
  });
  return response.data;
};

let isPasteAllowed = true;

const TechRound = () => {
  const [codeStore, setCodeStore] = useState({});
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [candidateEmails, setCandidatesEmails] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [problems, setProblems] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitRunning, setSubmitIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobRole, setjobRole] = useState("");
  const [companyName, setcompanyName] = useState("");
  const [techTiming, setTechTiming] = useState(
    localStorage.getItem("techTime") || 0
  );
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [passingMarks, setpassingMarks] = useState("");
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [showCheatingModal, setShowCheatingModal] = useState(false);
  const [currentlyScored, setCurrentlyScored] = useState(0);
  
  // Login form handler (Previously in UserInfoDialog)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !userId.trim()) {
      setLoginError("User ID is required.");
      return;
    }

    if (!name.trim()) {
      setLoginError("Name is required");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setLoginError("Please enter a valid email");
      return;
    }

    try {
      // Trim and validate userId before API call
      const trimmedUserId = userId.trim();
      
      // Validate MongoDB ObjectId format (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(trimmedUserId)) {
        setLoginError("Invalid Secret Key format. Please check the Secret Key from your email and try again.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/getUserInfo/${trimmedUserId}`);
      
      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      const emails =
        response.data.candidateData?.map((candidate) => candidate.email) || [];
      setCandidatesEmails(emails);

      // Only validate email if candidateData exists and has emails
      if (emails.length > 0) {
        const emailExists = emails.some(
          (candidateEmail) => candidateEmail === email
        );

        if (!emailExists) {
          setLoginError("Email does not match any candidate in this recruitment. Please check your email.");
          return;
        }
      } else {
        // If no candidate data, allow login but warn
        console.warn("No candidate data found, allowing login anyway");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      
      // Provide more specific error messages
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || "Invalid User ID format";
          setLoginError(errorMsg);
        } else if (error.response.status === 404) {
          setLoginError("User ID not found. Please check your secret key.");
        } else if (error.response.status === 500) {
          const errorMsg = error.response.data?.message || error.response.data?.error || "Server error. Please try again later.";
          setLoginError(errorMsg);
        } else {
          setLoginError(`Error: ${error.response.data?.message || "Failed to verify user info"}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setLoginError("Cannot connect to server. Please check your internet connection.");
      } else {
        // Something else happened
        setLoginError(`Error: ${error.message || "Failed to fetch user info"}`);
      }
      return;
    }

    // Store user data in localStorage (use trimmed userId)
    const trimmedUserId = userId.trim();
    localStorage.setItem("userName", name);
    localStorage.setItem("technicalUserId", trimmedUserId);
    localStorage.setItem("technicalUserEmail", email);

    isPasteAllowed = false;

    // Try to fetch tech time, but don't block login if it fails
    try {
      // Use trimmedUserId that was already validated above
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (objectIdPattern.test(trimmedUserId)) {
        const response = await axios.get(`${BACKEND_URL}/getUserInfo/${trimmedUserId}`);
        if (response.data) {
          const techTime = response.data.techTime || 0;
          localStorage.setItem("techTime", techTime);
        }
      } else {
        console.warn("Invalid userId format, using default tech time");
        localStorage.setItem("techTime", "60"); // Default 60 minutes
      }
    } catch (error) {
      console.warn("Could not fetch tech time, using default:", error);
      // Use default time if fetch fails
      localStorage.setItem("techTime", "60"); // Default 60 minutes
    }

    setShowLoginForm(false);
    setLoading(false);
    setLoginError(""); // Clear any errors
  };

  // Keep all existing useEffect hooks from TechRound component
  // Paste event listener
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isPasteAllowed) {
        e.preventDefault();
        alert("Pasting is disabled during the technical round.");
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isPasteAllowed) {
        setShowCheatingModal(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Timer effect
  useEffect(() => {
    let timerInterval;

    if (isTimerRunning && remainingTime > 0) {
      timerInterval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsTimerRunning(false);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning, remainingTime]);

  // Dark mode effect
  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document.body.classList.toggle("light", !isDarkMode);
  }, [isDarkMode]);

  // Fetch problems effect
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/getTech`, {
          params: {
            userId: userId,
            headers: { "Content-Type": "application/json" },
          },
        });
        const validProblems = response.data.techEntries.filter(
          (problem) => problem && typeof problem === "object" && problem.title
        );
        setProblems(validProblems);
        const initialCodeStore = {};
        validProblems.forEach((_, index) => {
          initialCodeStore[index] = "";
        });
        setCodeStore(initialCodeStore);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tech:", error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleEndSession = async () => {
    try {
      const userConfirmed = window.confirm(
        "Do you really want to end this session? All your problems will be sent for checking."
      );

      if (!userConfirmed) return;

      const userData = {
        userId: localStorage.getItem("technicalUserId"),
        userEmail: localStorage.getItem("technicalUserEmail"),
        technicalScore: currentlyScored,
      };

      const res = await axios
        .post(`${BACKEND_URL}/addScore`, {
          userId,
          candidateEmail: email,
          roundName: "technical",
          score: currentlyScored,
        })

        .then((res) => {
          console.log("Technical Score Stored");
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });

      const response = await axios.post(`${BACKEND_URL}/updateUser`, userData);
      console.log(response);

      // For email links, use IP address so candidates on other devices can access
      let frontendUrl = FRONTEND_URL || "http://localhost:5173";
      const networkIP = import.meta.env.VITE_NETWORK_IP || "192.168.197.79";
      
      if (frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1")) {
        // For emails, use IP address so others can access
        frontendUrl = frontendUrl.replace("localhost", networkIP).replace("127.0.0.1", networkIP);
      }
      
      // Handle HR email if user passed
      const templateParams = {
        to_email: email,
        jobRole: jobRole,
        linkForNextRound: `${frontendUrl}/hrRoundEntrance`,
        companyName: companyName,
      };

      try {
        await sendHREmail(templateParams);
        console.log("HR email sent successfully");
      } catch (emailError) {
        console.error("Failed to send HR email:", emailError);
      }

      alert(
        "Technical round completed successfully. You will receive an email with further instructions."
      );
      window.location.reload(true);
    } catch (error) {
      console.error("Error during end session:", error);
      alert("An error occurred while ending the session. Please try again.");
    }
  };

  // Fetch user info and set technical timing
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const userId = localStorage.getItem("technicalUserId");
        if (!userId || !userId.trim()) {
          console.error("No userId found in localStorage");
          return;
        }

        const trimmedUserId = userId.trim();
        // Validate ObjectId format before making request
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!objectIdPattern.test(trimmedUserId)) {
          console.error("Invalid userId format in localStorage");
          return;
        }

        const response = await axios.get(
          `${BACKEND_URL}/getUserInfo/${trimmedUserId}`
        );
        const userData = response.data;

        setTechTiming(userData.techTime || 0);
        setRemainingTime((userData.techTime || 0) * 60);
        setIsTimerRunning(true);
        setjobRole(userData.jobRole);
        setcompanyName(userData.companyName);
        setpassingMarks(userData.technicalPassingMarks);
      } catch (error) {
        console.error("Error initializing user data:", error);
        alert("Failed to initialize user data. Please refresh the page.");
      }
    };

    initializeUserData();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            handleTimeExpired();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, remainingTime]);

  const handleTestCases = (currentProblem, output) => {
    if (
      !currentProblem?.testCases ||
      !Array.isArray(currentProblem.testCases) ||
      currentProblem.testCases.length === 0
    ) {
      return [];
    }

    return currentProblem.testCases.map((testCase) => {
      // Ensure testCase and its properties exist and convert to strings
      const expectedOutput = String(testCase?.expectedOutput || "");
      const actualOutput = String(output || "");
      const input = String(testCase?.input || "");

      const isCorrect = compareTestCaseOutputs(expectedOutput, actualOutput);

      return {
        input,
        expectedOutput,
        actualOutput,
        isCorrect,
      };
    });
  };

  const handleTimeExpired = async () => {
    // Attempt to submit all solved problems
    try {
      for (let i = 0; i < problems.length; i++) {
        const problemCode = codeStore[i] || code;

        if (problemCode) {
          await axios.post(`${BACKEND_URL}/checkTechSolution`, {
            title: problems[i].title,
            desc: problems[i].desc,
            code: problemCode,
          });
        }
      }

      // Update user after submitting all problems
      handleEndSession();
    } catch (error) {
      console.error("Error submitting problems on time expiration:", error);
    }

    // You might want to add a modal or redirect logic here
    alert("Technical round time has expired!");
    handleEndSession();
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/getTech`, {
          params: { userId: localStorage.getItem("technicalUserId") },
          headers: { "Content-Type": "application/json" },
        });

        // Filter out empty problems and ensure we have valid problem objects
        const validProblems = response.data.techEntries.filter(
          (problem) => problem && typeof problem === "object" && problem.title
        );

        setProblems(validProblems);
        console.log("Tech data: ", validProblems);

        // Initialize code store for all problems
        const initialCodeStore = {};
        validProblems.forEach((_, index) => {
          initialCodeStore[index] = "";
        });
        setCodeStore(initialCodeStore);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tech:", error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Update the handleRunCode function
  const handleRunCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput("");
    setTestCaseResults([]);

    try {
      const result = await executeCode(selectedLanguage, code);
      const output = result.run.output || "No output";
      setOutput(output);

      const currentProblem = problems[currentProblemIndex];
      if (currentProblem) {
        const results = handleTestCases(currentProblem, output);
        setTestCaseResults(results);
      }
    } catch (err) {
      setError(err.message || "An error occurred while executing the code");
    } finally {
      setIsRunning(false);
    }
  };

  const compareTestCaseOutputs = (expectedOutput, actualOutput) => {
    // Ensure inputs are strings
    const trimmedExpected = String(expectedOutput).trim();
    const trimmedActual = String(actualOutput).trim();

    // Direct string comparison
    if (trimmedExpected === trimmedActual) {
      return true;
    }

    // Number comparison
    const numExpected = Number(trimmedExpected);
    const numActual = Number(trimmedActual);
    if (!isNaN(numExpected) && !isNaN(numActual) && numExpected === numActual) {
      return true;
    }

    // Float comparison with precision
    const floatExpected = parseFloat(trimmedExpected);
    const floatActual = parseFloat(trimmedActual);
    if (!isNaN(floatExpected) && !isNaN(floatActual)) {
      return Math.abs(floatExpected - floatActual) < 1e-9;
    }

    // Array-like comparison
    const normalizeArrayOutput = (output) => {
      try {
        return String(output)
          .replace(/[\[\]]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .map((item) => item.trim())
          .filter((item) => item !== "")
          .join(" ");
      } catch (error) {
        console.error("Error normalizing array output:", error);
        return String(output);
      }
    };

    const normalizedExpected = normalizeArrayOutput(trimmedExpected);
    const normalizedActual = normalizeArrayOutput(trimmedActual);

    return normalizedExpected === normalizedActual;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formatDescription = (desc) => {
    if (!desc) return null;

    return desc.split("\n").map((line, index) => {
      const trimmedLine = line.trim();
      const isExample = trimmedLine.toLowerCase().startsWith("example");
      const isConstraint = trimmedLine.toLowerCase().startsWith("constraints");
      const isInput = trimmedLine.toLowerCase().startsWith("input:");
      const isOutput = trimmedLine.toLowerCase().startsWith("output:");
      const isBulletPoint = trimmedLine.startsWith("•");

      const className = `mb-2 ${
        isDarkMode
          ? isExample
            ? "text-blue-400"
            : isConstraint
            ? "text-purple-400"
            : isInput
            ? "text-emerald-400"
            : isOutput
            ? "text-orange-400"
            : isBulletPoint
            ? "text-gray-300"
            : "text-gray-200"
          : isExample
          ? "text-blue-600"
          : isConstraint
          ? "text-purple-600"
          : isInput
          ? "text-emerald-600"
          : isOutput
          ? "text-orange-600"
          : isBulletPoint
          ? "text-gray-600"
          : "text-gray-800"
      } ${
        isExample || isConstraint
          ? "font-semibold text-lg mt-4"
          : isInput || isOutput
          ? "font-medium ml-4"
          : isBulletPoint
          ? "ml-6"
          : ""
      }`;

      return (
        <p key={index} className={className}>
          {trimmedLine}
        </p>
      );
    });
  };

  useEffect(() => {
    console.log("State Update:", {
      currentProblemIndex,
      code,
      codeStore,
    });
  }, [currentProblemIndex, code, codeStore]);

  const handleProblemChange = (newIndex) => {
    console.log("Handle problem change");
    console.log("newIndex:", newIndex);

    if (newIndex < 0 || newIndex >= problems.length) return;

    // First save the current code
    setCodeStore((prev) => {
      const updatedStore = {
        ...prev,
        [currentProblemIndex]: code || "",
      };
      console.log("Updated codeStore:", updatedStore);
      return updatedStore;
    });

    // Reset states before changing problem
    setOutput("");
    setError(null);
    setTestCaseResults([]); // Reset test case results

    // Update the current problem index
    setCurrentProblemIndex(newIndex);

    // Load the code for the new problem
    setCode((prev) => {
      const storedCode = codeStore[newIndex];
      console.log(`Loading code for problem ${newIndex}:`, storedCode);
      return storedCode || "";
    });
  };

  useEffect(() => {
    console.log("Problems array:", problems);
    if (!Array.isArray(problems)) {
      console.error("Problems is not an array:", problems);
    }
  }, [problems]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document.body.classList.toggle("light", !isDarkMode);
  }, [isDarkMode]);

  if (showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Technical Round
          </h2>
          <form onSubmit={handleLoginSubmit}>
            {/* Login form fields */}
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-3 rounded-lg bg-gray-100 border-gray-300 text-gray-800"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="userId" className="block mb-2 text-gray-700">
                Secret Key
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                placeholder="Enter your user ID"
                className="w-full p-3 rounded-lg bg-gray-100 border-gray-300 text-gray-800"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-gray-100 border-gray-300 text-gray-800"
              />
            </div>
            {loginError && (
              <div className="mb-4 p-3 rounded-lg text-center bg-red-100 text-red-600 border border-red-300">
                <strong>Error:</strong> {loginError}
              </div>
            )}
            <button className="w-full p-3 rounded-lg transition-colors bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Start Technical Round
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        Loading problems...
      </div>
    );
  }

  if (!problems || !Array.isArray(problems) || problems.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        No problems found. Please contact support.
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        No problems found.
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex] || {};
  if (!currentProblem) {
    return null;
  }
  const handleSubmit = async () => {
    setSubmitIsRunning(true);
    setError(null);
    setOutput("");

    try {
      const currentProblem = problems[currentProblemIndex];
      
      // Validate required data
      if (!currentProblem) {
        setError("No problem selected. Please select a problem.");
        setSubmitIsRunning(false);
        return;
      }

      if (!code || !code.trim()) {
        setError("Please write some code before submitting.");
        setSubmitIsRunning(false);
        return;
      }

      if (!currentProblem.title || !currentProblem.desc) {
        setError("Problem data is incomplete. Please refresh the page.");
        setSubmitIsRunning(false);
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/checkTechSolution`, {
        title: currentProblem.title,
        desc: currentProblem.desc,
        code: code.trim(),
      });

      // Check if response has the expected structure
      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      // Handle both success and error responses
      if (response.data.success === false) {
        setError(response.data.error || "Evaluation failed. Please check your code.");
        setOutput("");
        setSubmitIsRunning(false);
        return;
      }

      // Update score only if solution is correct
      const isSuccess = response.data.cleanedResponse && response.data.cleanedResponse.success;
      if (isSuccess) {
        setCurrentlyScored((prev) => prev + 1);
      }

      const summary = response.data.cleanedResponse?.summary || "Evaluation successful";
      setOutput(summary);
      
      // Clear error if submission was successful
      setError(null);

      // Show success message with instructions
      if (isSuccess) {
        const currentProblemNum = currentProblemIndex + 1;
        const totalProblems = problems.length;
        const remainingProblems = totalProblems - currentProblemNum;
        
        if (remainingProblems > 0) {
          alert(
            `✓ Problem ${currentProblemNum} solved successfully!\n\n` +
            `You have ${remainingProblems} more problem(s) to solve.\n\n` +
            `Click the next arrow (→) to move to the next problem, or continue working on other problems.\n\n` +
            `When you're done with all problems, click "End Session" to submit.`
          );
        } else {
          alert(
            `✓ Congratulations! All problems have been solved!\n\n` +
            `You can review your solutions or click "End Session" to submit your final answers.\n\n` +
            `Note: Make sure you've solved all problems before ending the session.`
          );
        }
      }
    } catch (error) {
      console.error("Error during submission:", error);
      
      // Provide more specific error messages
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message ||
                            "Server error while evaluating your code";
        setError(errorMessage);
        
        // Also show in output if available
        if (error.response.data?.details) {
          setOutput(error.response.data.details);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("Cannot connect to server. Please check your internet connection and try again.");
      } else {
        // Something else happened
        setError(error.message || "An error occurred while evaluating your code. Please try again.");
      }
    } finally {
      setSubmitIsRunning(false);
    }
  };

  const renderTestCases = () => {
    const currentProblem = problems[currentProblemIndex];

    if (
      !currentProblem?.testCases ||
      !Array.isArray(currentProblem.testCases) ||
      currentProblem.testCases.length === 0
    ) {
      return (
        <div
          className={`text-center py-8 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          No test cases available for this problem
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {currentProblem.testCases.map((testCase, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              isDarkMode
                ? "bg-gray-900/50 border-gray-700"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Test Case {index + 1}
              </span>
              {testCaseResults[index] &&
                (testCaseResults[index].isCorrect ? (
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5" />
                ))}
            </div>
            <div
              className={`mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="font-medium">Input:</span>{" "}
              {String(testCase?.input || "")}
            </div>
            <div
              className={`mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="font-medium">Expected:</span>{" "}
              {String(testCase?.expectedOutput || "")}
            </div>
            {testCaseResults[index] && (
              <div
                className={
                  testCaseResults[index].isCorrect
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                <span className="font-medium">Actual:</span>{" "}
                {String(testCaseResults[index].actualOutput || "")}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen min-w-full p-4 flex ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"
      }`}
    >
      <div className="grid grid-cols-2 gap-4 w-full h-[calc(100vh-2rem)]">
        {/* Left Panel */}
        <div
          className={`relative rounded-xl shadow-lg p-4 flex flex-col overflow-hidden ${
            isDarkMode
              ? "bg-gray-800/80 border border-gray-700"
              : "bg-white/90 border border-gray-200"
          }`}
        >
          {/* Problem Navigation and Theme Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Existing navigation buttons */}
              <button
                onClick={handleEndSession}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-700 hover:bg-red-800 text-white"
                }`}
              >
                End Session
              </button>
              {/* Timer Display */}
              <div
                className={`flex items-center px-4 py-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-200 text-gray-800"
                } ${remainingTime <= 60 ? "animate-pulse text-red-500" : ""}`}
              >
                <Clock className="mr-2 h-5 w-5" />
                <span className="font-mono text-sm">
                  {formatTime(remainingTime)}
                </span>
              </div>
              <button
                onClick={() => handleProblemChange(currentProblemIndex - 1)}
                disabled={currentProblemIndex === 0}
                className={`p-2 rounded-full ${
                  currentProblemIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                <ChevronLeft
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                />
              </button>

              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Problem {currentProblemIndex + 1} of {problems.length}
              </span>

              <button
                onClick={() => handleProblemChange(currentProblemIndex + 1)}
                disabled={currentProblemIndex === problems.length - 1}
                className={`p-2 rounded-full ${
                  currentProblemIndex === problems.length - 1
                    ? "opacity-50 cursor-not-allowed"
                    : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                <ChevronRight
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                />
              </button>
            </div>

            {/* Timer and Theme Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <h1
            className={`text-3xl font-bold mb-4 ${
              isDarkMode
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
            }`}
          >
            {currentProblem.title}
          </h1>
          <div className="prose max-w-none overflow-y-auto pr-2">
            {formatDescription(currentProblem.desc)}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4 h-full">
          {/* Code Editor */}
          <div
            className={`rounded-xl shadow-lg p-4 flex-1 flex flex-col ${
              isDarkMode
                ? "bg-gray-800/80 border border-gray-700"
                : "bg-white/90 border border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-48 p-2 rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSubmit}
                disabled={isSubmitRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                }`}
              >
                <Play className="h-4 w-4" />
                {isSubmitRunning ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                }`}
              >
                <Play className="h-4 w-4" />
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
            <div
              className={`rounded-lg overflow-hidden flex-1 ${
                isDarkMode
                  ? "border border-gray-700 bg-gray-900/50"
                  : "border border-gray-300 bg-gray-50"
              }`}
            >
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  // handleCodeChange(e.target.value);
                }}
                className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-transparent ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
                spellCheck="false"
                placeholder="Write your code here..."
              />
            </div>
          </div>

          {/* Output and Test Cases Panel */}
          <div className="flex gap-4 h-[250px]">
            {/* Output Panel */}
            <div
              className={`w-1/2 rounded-xl shadow-lg p-4 ${
                isDarkMode
                  ? "bg-gray-800/80 border border-gray-700"
                  : "bg-white/90 border border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
                }`}
              >
                Output
              </h2>

              {error && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    isDarkMode
                      ? "bg-red-900/50 border-red-700"
                      : "bg-red-100 border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    <AlertCircle
                      className={`h-4 w-4 ${
                        isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                    />
                    <div
                      className={`ml-2 font-semibold ${
                        isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      Error
                    </div>
                  </div>
                  <div
                    className={`mt-2 ${
                      isDarkMode ? "text-red-200" : "text-red-700"
                    }`}
                  >
                    {error}
                  </div>
                </div>
              )}

              <pre
                className={`p-4 rounded-lg h-32 overflow-auto font-mono text-sm ${
                  isDarkMode
                    ? "bg-gray-900/50 border border-gray-700 text-gray-200"
                    : "bg-gray-50 border border-gray-300 text-gray-800"
                }`}
                style={{
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                }}
              >
                {output || "Run your code to see the output here..."}
              </pre>
            </div>

            {/* Test Cases Panel */}
            <div
              className={`w-1/2 rounded-xl shadow-lg p-4 overflow-auto ${
                isDarkMode
                  ? "bg-gray-800/80 border border-gray-700"
                  : "bg-white/90 border border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                }`}
              >
                Manual Test Cases
              </h2>

              {renderTestCases()}
            </div>
          </div>
        </div>
      </div>

      {showCheatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Cheating Detected
            </h2>
            <p className="mb-6">
              You have been detected switching tabs or minimizing the browser
              during the technical round.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // Redirect to exit page or close the application
                  window.location.reload();
                  window.exit();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Exit, You have been rejected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechRound;
