# Proposed Methodology - SmartHire-X

The SmartHire-X system follows a modular and scalable methodology to automate and secure the recruitment process. The project is divided into three core evaluation stages: Aptitude, Technical/Coding, and HR Interview, each powered by specialized technologies.

## 1. Aptitude Round

An intelligent assessment engine will auto-generate aptitude questions using **Google Generative AI (Gemini 1.5 Flash)** or fetch questions from **GeeksforGeeks** through web scraping. Questions can also be manually input by recruiters. The generated questions are stored in **MongoDB** for reuse and management.

**Scoring**: Automated evaluation scripts handle instant scoring based on candidate responses.

**Proctoring System**: 
- Real-time face detection and frame capturing using **face-api.js** (built on TensorFlow.js) ensures assessment integrity
- Anti-cheating mechanisms trigger alerts for multiple faces or unauthorized activity
- Screenshots are automatically captured and stored when suspicious behavior is detected
- All proctoring events are logged in MongoDB for review

## 2. Technical Round

This round features a code editor with **multi-language compiler integration via Piston API** (emkc.org), supporting languages including Python, JavaScript, Java, C, C++, Go, Ruby, Rust, and PHP.

**Code Evaluation**:
- Submitted code is executed in real-time using secure API endpoints
- Code correctness, performance, and syntax are evaluated using **Google Generative AI (Gemini)** for intelligent analysis
- Test case validation ensures comprehensive code assessment
- Scores are automatically calculated and stored in MongoDB

## 3. HR Interview Round

Built using **ZEGOCLOUD's WebRTC-based video conferencing platform**, this round enables:
- Real-time video interaction between recruiters and candidates
- Interactive chat functionality
- Screen sharing capabilities
- Interview recording (optional)

**AI-Powered Facial Behavior Analysis**:
- Real-time facial expression detection using **face-api.js emotion recognition models**
- Emotion classification (happy, neutral, surprised, sad, angry, fearful, disgusted) throughout the interview
- Communication clarity assessment based on positive emotion indicators
- Automated HR interview scoring that combines:
  - Average confidence levels from emotion detection
  - Dominant emotions identified during the session
  - Communication clarity metrics
- All analysis data is stored in MongoDB for recruiter review and candidate ranking

## 4. Automated Communication Module

An automated communication system using **EmailJS service** manages:
- Candidate notifications at each stage of the recruitment process
- Status updates (interview scheduled, results uploaded, round progression)
- Automated email workflows for:
  - Next round invitations
  - Rejection notifications
  - HR interview meeting links
  - Cheating detection alerts
- Transparent candidate journey tracking

## 5. Data Management

All user data, performance metrics, and logs are stored securely in **MongoDB**:
- Candidate profiles and authentication data
- Assessment scores (Aptitude, Technical, Communication, HR Interview)
- HR interview analysis data (emotion data, confidence metrics, clarity scores)
- Proctoring logs and cheating incidents
- Job postings and candidate applications
- Resume screening results

The system provides real-time dashboards for recruiters to track candidate progress, view rankings, and access detailed analytics across all evaluation stages.

---

**Technology Stack Summary**:
- **Face Detection**: face-api.js (TensorFlow.js-based)
- **Code Execution**: Piston API (emkc.org)
- **Video Conferencing**: ZEGOCLOUD (WebRTC-based)
- **Email Service**: EmailJS
- **Database**: MongoDB
- **AI Services**: Google Generative AI (Gemini 1.5 Flash)
- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Vite


