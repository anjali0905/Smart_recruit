import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sendEmail from "../components/email";
import axios from "axios";

export default function HRRoundInfo() {
  const [isInstructionsRead, setIsInstructionsRead] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const [candidatesEmail, setCandidatesEmails] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const VITE_FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const handleProceed = () => {
    if (isInstructionsRead) {
      handleSendEmails();
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/dashboard");
      }, 1700);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No userId found in localStorage.");
          return;
        }

        const response = await axios.get(
          `${BACKEND_URL}/getUserInfo/${userId}`
        );
        console.log("Dashboard data:", response.data);

        // Extract only emails from candidateData
        const emails =
          response.data.candidateData?.map((candidate) => candidate.email) ||
          [];
        setCandidatesEmails(emails); // Assuming you have a state like setCandidatesEmails
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSendEmails = async () => {
    // Retrieve candidate data (name and email) from localStorage
    const candidateData = candidatesEmail;
    console.log("Emails to be sent: ", candidateData);

    // Validate that userId exists before sending emails
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Error: User ID (Secret Key) not found. Please log in again.");
      return;
    }

    const companyName = localStorage.getItem("companyName") || "Your Company";
    const HRemail = localStorage.getItem("email") || "hr@yourcompany.com";

    // Check for aptitudeDuration or technicalDuration
    const aptitudeDuration = localStorage.getItem("aptitudeDuration");
    const technicalDuration = localStorage.getItem("technicalDuration");

    // If no candidate data found
    if (!candidateData || candidateData.length === 0) {
      alert("No candidate emails found. Please add candidates first.");
      return;
    }

    // Determine which test to send based on the available duration
    const duration = aptitudeDuration || technicalDuration;
    const testType = aptitudeDuration
      ? "Aptitude Test with Reasoning"
      : "Technical Test";
    
    // For email links, use IP address so candidates on other devices can access
    // Keep HTTP for local development, only replace localhost with IP
    let frontendUrl = VITE_FRONTEND_URL || "http://localhost:5173";
    const networkIP = import.meta.env.VITE_NETWORK_IP || "192.168.197.79";
    
    if (frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1")) {
      // For emails, use IP address so others can access
      frontendUrl = frontendUrl.replace("localhost", networkIP).replace("127.0.0.1", networkIP);
    }
    
    const testLink = aptitudeDuration
      ? `${frontendUrl}/quizRound`
      : `${frontendUrl}/techRound`;
    const subject = `${testType} Invitation for ${companyName}`;

    // Function to delay execution for rate limiting
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let successCount = 0;
    let failCount = 0;
    const failedEmails = [];

    try {
      for (const email of candidateData) {
        // Validate email format
        if (!email || !email.includes("@")) {
          console.warn(`Invalid email format: ${email}`);
          failCount++;
          failedEmails.push(email);
          continue;
        }

        // userId is already validated at the start, use it here
        const templateParams = {
          candidateName: "Candidate", // Since you only have emails, use a generic name
          user_id: userId, // Secret key for candidates to use
          secretKey: userId, // Also include as secretKey for clarity
          secret_key: userId, // Alternative naming for email template
          userId: userId, // Another alternative
          companyName,
          dateAndTime: "12th Dec 2024, 10:00 AM", // Example date and time
          duration: duration || "60", // Use duration from localStorage, or fallback to 60 minutes
          testLink,
          hr_email: HRemail,
          to_email: email, // Send email to the candidate's email
          subject,
          roundName: testType,
        };

        try {
          await sendEmail(templateParams); // Attempt to send the email
          console.log(`✓ Email sent successfully to ${email}`);
          successCount++;
        } catch (error) {
          console.error(`✗ Error sending email to ${email}:`, error);
          failCount++;
          failedEmails.push(email);
        }

        // Delay between email sends to avoid rate limits (800ms delay)
        await delay(800);
      }

      // Show detailed results
      if (successCount > 0 && failCount === 0) {
        alert(`✓ Successfully sent emails to all ${successCount} candidate(s).`);
      } else if (successCount > 0 && failCount > 0) {
        alert(`⚠ Sent emails to ${successCount} candidate(s). Failed to send to ${failCount} candidate(s).\n\nFailed emails: ${failedEmails.join(", ")}`);
      } else {
        alert(`✗ Failed to send emails to all candidates.\n\nFailed emails: ${failedEmails.join(", ")}`);
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert(`An error occurred while sending emails: ${error.message || "Please try again."}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
          HR Round Instructions
        </h1>
        <div className="space-y-6 text-gray-700">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Instructions:
            </h2>
            <ul className="space-y-3 list-disc list-inside text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">→</span>
                Both you and the candidate will receive an interview key and a
                link via email at the scheduled time.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">→</span>
                Open the provided link and enter the interview key.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">→</span>
                Once both parties have joined, the interview will begin.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">→</span>
                After the interview is completed, the recruiter will decide
                whether the candidate is selected or not.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">→</span>
                Based on the recruiter’s decision, a response will be sent to
                the candidate via email.
              </li>
            </ul>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="instructions-read"
              checked={isInstructionsRead}
              onChange={() => setIsInstructionsRead(!isInstructionsRead)}
              className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="instructions-read"
              className="text-gray-700 font-medium"
            >
              I have read and understood the HR Round Instructions
            </label>
          </div>
          <button
            onClick={handleProceed}
            disabled={!isInstructionsRead}
            className={`w-full py-3 px-8 rounded-lg transition-all text-lg font-semibold ${isInstructionsRead
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Proceed to Next Round
          </button>

          {showToast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
              HR Round Information
              <p className="text-sm mt-1">
                You have successfully proceeded to the next round.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
