export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

// Helper function to get network-accessible frontend URL for emails
// This is ONLY used when sending emails, not for app navigation
export const getNetworkFrontendUrl = () => {
  let url = FRONTEND_URL || "http://localhost:5173";
  // Get network IP from environment or use current hostname's IP
  // You can override this with VITE_NETWORK_IP environment variable
  const networkIP = import.meta.env.VITE_NETWORK_IP || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? window.location.hostname 
      : "192.168.1.182"); // Fallback to current network IP
  
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Replace with IP for email links so others can access
    url = url.replace("localhost", networkIP).replace("127.0.0.1", networkIP);
  }
  return url;
};




