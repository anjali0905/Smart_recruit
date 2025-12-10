import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { Mail } from "lucide-react";
import axios from "axios";
import sendMeetInvitation from "../components/MeetInvitation";
import HRFacialAnalysis from "../components/HRFacialAnalysis";

export default function HRRound() {
  const { id, candidateEmail } = useParams();
  const meetingContainerRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [companyName, setcompanyName] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [zegoError, setZegoError] = useState("");
  const [askingCreds, setAskingCreds] = useState(false);
  const [appIdInput, setAppIdInput] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [currentKitToken, setCurrentKitToken] = useState("");
  const [showFacialAnalysis, setShowFacialAnalysis] = useState(false);
  const [userId, setUserId] = useState("");

  const sanitizeId = (value, fallback) => {
    const v = (value || fallback || "room").toString();
    const cleaned = v.replace(/[^a-zA-Z0-9_\-]/g, "-").slice(0, 64);
    return cleaned.length ? cleaned : "room";
  };

  const urlParams = new URLSearchParams(window.location.search);
  const rawRoom = urlParams.get("roomID") || id || localStorage.getItem("hrRoomId") || "default-room";
  const roomID = sanitizeId(rawRoom, "default-room");
  const inviteKitToken = urlParams.get("kitToken") || "";

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId || "");
    const fetchCandidateData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/getUserInfo/${storedUserId}`);
        setcompanyName(response.data.companyName);
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };
    if (storedUserId) {
      fetchCandidateData();
    }
  }, []);

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 7000);
  };

  const sendMeetingLink = async (kitToken) => {
    const loader = document.createElement("div");
    loader.classList.add("loader-container");
    loader.innerHTML = `\n      <div class=\"loader\"></div>\n    `;
    document.body.appendChild(loader);

    // For email links, use IP address so candidates on other devices can access
    let host = window.location.host;
    const networkIP = import.meta.env.VITE_NETWORK_IP || "192.168.1.182";
    
    // Replace localhost with network IP for email links
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      host = host.replace("localhost", networkIP).replace("127.0.0.1", networkIP);
    }
    
    const meetingLink = `${window.location.protocol}//${host}${window.location.pathname}?roomID=${roomID}&kitToken=${encodeURIComponent(kitToken)}`;

    const templateParams = {
      meet_link: meetingLink,
      company_name: companyName,
      to_email: localStorage.getItem("candidateEmailForMeet"),
    };

    try {
      await sendMeetInvitation(templateParams);
      loader.remove();
      showToast('Email successfully sent to the candidate. They can now join the meeting.');
      setSent(true);
    } catch (emailError) {
      loader.remove();
      console.error("Failed to send email:", emailError);
      showToast('Failed to send email. Please try again.', 'error');
    }
  };

  // Helper function to get network-accessible URL
  const getNetworkUrl = (path, queryParams = {}) => {
    let host = window.location.host;
    const networkIP = import.meta.env.VITE_NETWORK_IP || "192.168.1.182";
    
    // Replace localhost with network IP for sharing
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      host = host.replace("localhost", networkIP).replace("127.0.0.1", networkIP);
    }
    
    const queryString = new URLSearchParams(queryParams).toString();
    return `${window.location.protocol}//${host}${path}${queryString ? `?${queryString}` : ''}`;
  };

  const tryJoinRoom = () => {
    if (!meetingContainerRef.current) return;

    // If kitToken present in URL (guest flow), use directly
    if (inviteKitToken) {
      try {
        // Create network-accessible link for sharing
        const shareUrl = getNetworkUrl(window.location.pathname, {
          roomID: roomID,
          kitToken: inviteKitToken
        });
        
        const zp = ZegoUIKitPrebuilt.create(inviteKitToken);
        zp.joinRoom({
          container: meetingContainerRef.current,
          sharedLinks: [
            { name: "Copy link", url: shareUrl },
          ],
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        });
        setZegoError("");
        return;
      } catch (e) {
        console.error("Failed to join with provided kitToken:", e);
        setZegoError("Invalid or expired meeting link. Ask the host to resend.");
        return;
      }
    }

    const envAppID = import.meta.env.VITE_ZEGO_APP_ID;
    const envSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const localAppID = localStorage.getItem("ZEGO_APP_ID");
    const localSecret = localStorage.getItem("ZEGO_SERVER_SECRET");

    const appIDRaw = envAppID || localAppID;
    const serverSecret = envSecret || localSecret;

    if (!appIDRaw || !serverSecret) {
      setZegoError("Zego credentials missing. Set in .env.local or enter below.");
      setAskingCreds(true);
      return;
    }

    const appID = Number(appIDRaw);
    if (!Number.isFinite(appID)) {
      setZegoError("Invalid Zego App ID. Must be a number.");
      setAskingCreds(true);
      return;
    }

    const userName = (localStorage.getItem("name") || "Recruiter").toString().slice(0, 30);
    const userID = sanitizeId(`${localStorage.getItem("userId") || "user"}-${Date.now()}`, "user");

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );
      setCurrentKitToken(kitToken);

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      try { zp.on && zp.on('error', (e) => {
        console.error('Zego error:', e);
        setZegoError(typeof e === 'string' ? e : (e?.message || 'Unknown error'));
      }); } catch {}

      // Create network-accessible link for sharing
      const shareUrl = getNetworkUrl(window.location.pathname, {
        roomID: roomID,
        kitToken: kitToken
      });
      
      zp.joinRoom({
        container: meetingContainerRef.current,
        sharedLinks: [
          {
            name: "Copy link",
            url: shareUrl,
          },
        ],
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      });

      localStorage.setItem("hrRoomId", roomID);
      // Send invite link that contains the kitToken so guests can join without creds
      sendMeetingLink(kitToken);
      setZegoError("");
      setAskingCreds(false);
    } catch (e) {
      console.error("Failed to start Zego room:", e);
      setZegoError("Failed to start video room. Check app ID/secret and network.");
    }
  };

  useEffect(() => {
    tryJoinRoom();
  }, [roomID]);

  const handleSaveCreds = () => {
    if (!appIdInput || !secretInput) {
      setZegoError("Please enter both App ID and Server Secret.");
      return;
    }
    localStorage.setItem("ZEGO_APP_ID", appIdInput.trim());
    localStorage.setItem("ZEGO_SERVER_SECRET", secretInput.trim());
    setZegoError("");
    setAskingCreds(false);
    setTimeout(tryJoinRoom, 100);
  };

  return (
    <div className="relative h-screen">
      {zegoError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
          {zegoError}
        </div>
      )}

      {askingCreds && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Enter ZEGOCLOUD Credentials</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">App ID (Number)</label>
                <input value={appIdInput} onChange={(e) => setAppIdInput(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., 123456789" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Server Secret</label>
                <input value={secretInput} onChange={(e) => setSecretInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Your server secret" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAskingCreds(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={handleSaveCreds} className="px-4 py-2 bg-blue-600 text-white rounded">Save & Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={meetingContainerRef} className="h-full" />
      
      {/* Facial Analysis Toggle Button */}
      <button
        onClick={() => setShowFacialAnalysis(!showFacialAnalysis)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 flex items-center gap-2"
        title="Toggle Facial Behavior Analysis"
      >
        <span>{showFacialAnalysis ? "Hide" : "Show"} Analysis</span>
      </button>

      {/* Facial Analysis Component */}
      {showFacialAnalysis && userId && (
        <HRFacialAnalysis
          candidateEmail={localStorage.getItem("candidateEmailForMeet") || candidateEmail || ""}
          userId={userId}
          onAnalysisComplete={(analysis) => {
            console.log("HR Interview Analysis Complete:", analysis);
          }}
        />
      )}
    </div>
  );
}