import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Recruiter from "./pages/Recruiter";
import CandidateUpload from "./pages/CandidateUpload";
import RoundSelection from "./pages/RoundSelection";
import AptitudeInfo from "./pages/AptitudeInfo";
import TechnicalInfo from "./pages/TechnicalInfo";
import HRRoundInfo from "./pages/HrRoundInfo";
import TechRound from "./pages/TechRound";
import QuizComponent from "./pages/QuizRound";
import RecruitmentDashboard from "./pages/Dashboard";
import HRRoundEntrance from "./pages/HRRoundEntrance";
import HRRound from "./pages/HRRound.jsx";
import Chat from "./pages/Chat";
import AllJobsDisplay from "./pages/AllJobs";
import CRRound from "./pages/CRRound";
import JobPosting from "./pages/JobPosting";

import JobApplication from "./pages/JobApplication";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import CommunicationRound from "./pages/CommunicationRound";
import CommunicationInfo from "./pages/CommunicationInfo";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />

        {/* Public-only routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/recruiter" element={<ProtectedRoute><Recruiter /></ProtectedRoute>} />
        <Route path="/aptitudeInfo" element={<ProtectedRoute><AptitudeInfo /></ProtectedRoute>} />
        <Route path="/technicalInfo" element={<ProtectedRoute><TechnicalInfo /></ProtectedRoute>} />
        <Route path="/hrInfo" element={<ProtectedRoute><HRRoundInfo /></ProtectedRoute>} />
        <Route path="/candidateUpload" element={<ProtectedRoute><CandidateUpload /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><AllJobsDisplay /></ProtectedRoute>} />
        <Route path="/roundSelection" element={<ProtectedRoute><RoundSelection /></ProtectedRoute>} />
        <Route path="/quizRound" element={<ProtectedRoute><QuizComponent /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><RecruitmentDashboard /></ProtectedRoute>} />
        <Route path="/techRound" element={<ProtectedRoute><TechRound /></ProtectedRoute>} />
        <Route path="/techInfo" element={<ProtectedRoute><TechnicalInfo /></ProtectedRoute>} />
        <Route path="/hrRoundEntrance" element={<ProtectedRoute><HRRoundEntrance /></ProtectedRoute>} />
        <Route path="/hrRound/:id" element={<ProtectedRoute><HRRound /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/jobApplication/:jobId" element={<ProtectedRoute><JobApplication /></ProtectedRoute>} />
        <Route path="/communicationRound" element={<ProtectedRoute><CommunicationRound /></ProtectedRoute>} />
        <Route path="/communicationInfo" element={<ProtectedRoute><CommunicationInfo /></ProtectedRoute>} />
        <Route path="/jobPosting" element={<ProtectedRoute><JobPosting /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
