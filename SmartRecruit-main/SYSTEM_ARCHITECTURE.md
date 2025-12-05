# SmartHire-X System Architecture

## Overview
SmartHire-X follows a modular, three-tier architecture with clear separation between presentation, business logic, and data layers. The system is designed for scalability, maintainability, and seamless integration of AI-powered features.

---

## Architecture Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend Application (React.js + Vite)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Pages      │  │  Components   │  │   Services    │ │   │
│  │  │              │  │               │  │               │ │   │
│  │  │ - MainPage   │  │ - Login       │  │ - API Calls   │ │   │
│  │  │ - Dashboard  │  │ - Signup      │  │ - Auth        │ │   │
│  │  │ - Recruiter  │  │ - Navbar      │  │ - Routing     │ │   │
│  │  │ - QuizRound  │  │ - Protected   │  │               │ │   │
│  │  │ - TechRound  │  │   Routes      │  │               │ │   │
│  │  │ - HRRound    │  │               │  │               │ │   │
│  │  │ - AllJobs    │  │               │  │               │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                           │   │
│  │  Client-Side Libraries:                                  │   │
│  │  - face-api.js (Proctoring)                              │   │
│  │  - pdfjs-dist (Resume Parsing)                           │   │
│  │  - @zegocloud/zego-uikit-prebuilt (Video Interviews)     │   │
│  │  - axios (HTTP Client)                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                    APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Backend Server (Node.js + Express.js)                    │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Route Handlers (RESTful API Endpoints)             │  │ │
│  │  │                                                      │  │ │
│  │  │  Authentication Module:                              │  │ │
│  │  │  - POST /signup                                     │  │ │
│  │  │  - POST /login                                      │  │ │
│  │  │  - PUT /updateUser                                  │  │ │
│  │  │  - GET /getUserInfo/:userId                         │  │ │
│  │  │                                                      │  │ │
│  │  │  Job Management Module:                             │  │ │
│  │  │  - POST /createJob                                  │  │ │
│  │  │  - GET /allJob                                      │  │ │
│  │  │  - GET /getJob/:jobId                               │  │ │
│  │  │  - PUT /updateJob/:jobId                            │  │ │
│  │  │  - DELETE /deleteJob/:jobId                         │  │ │
│  │  │  - GET /jobs/:userId                                │  │ │
│  │  │                                                      │  │ │
│  │  │  Resume Processing Module:                          │  │ │
│  │  │  - POST /scanResume                                 │  │ │
│  │  │  - GET /getExcelFile/:userId                        │  │ │
│  │  │                                                      │  │ │
│  │  │  AI Generation Module:                              │  │ │
│  │  │  - GET /generateQuiz?quizType=...                  │  │ │
│  │  │  - GET /generateTech?techType=...                  │  │ │
│  │  │  - GET /generateComm?prompt=...                     │  │ │
│  │  │  - GET /generateReadAndSpeak?prompt=...            │  │ │
│  │  │  - GET /generateListenAndSpeak?prompt=...          │  │ │
│  │  │  - GET /generateTopicAndSpeech?prompt=...           │  │ │
│  │  │  - POST /checkTechSolution                          │  │ │
│  │  │                                                      │  │ │
│  │  │  Assessment Management Module:                      │  │ │
│  │  │  - POST /addQuiz                                    │  │ │
│  │  │  - GET /getQuiz/:userId                            │  │ │
│  │  │  - POST /addTech                                    │  │ │
│  │  │  - GET /getTech/:userId                             │  │ │
│  │  │  - POST /addCommunication                           │  │ │
│  │  │  - GET /getCommunication/:userId                   │  │ │
│  │  │  - GET /allCommunication/:userId                    │  │ │
│  │  │                                                      │  │ │
│  │  │  Scoring & Analytics Module:                        │  │ │
│  │  │  - POST /addScore                                   │  │ │
│  │  │  - POST /addHRInterviewAnalysis                     │  │ │
│  │  │  - GET /allScores/:userId                           │  │ │
│  │  │  - POST /cheatingDetected                           │  │ │
│  │  │  - POST /uploadScreenshot                           │  │ │
│  │  │                                                      │  │ │
│  │  │  User Management Module:                            │  │ │
│  │  │  - GET /allUser                                    │  │ │
│  │  │  - DELETE /deleteUser/:userId                      │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Utility Services                                   │  │ │
│  │  │  - excelUtils.js (Excel file generation)           │  │ │
│  │  │  - uploadImage.js (Image upload to Cloudinary)     │  │ │
│  │  │  - deepseek.js (Alternative AI service)            │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  MongoDB Database                                         │ │
│  │                                                            │ │
│  │  Collections:                                             │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  User Model (userModel.js)                          │ │ │
│  │  │  - userId, name, email, password (hashed)           │ │ │
│  │  │  - role, createdAt, updatedAt                       │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Job Model (jobModel.js)                            │ │ │
│  │  │  - jobId, userId, jobRole, description             │ │ │
│  │  │  - requirements, location, salary                   │ │ │
│  │  │  - createdAt, updatedAt                             │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Quiz Model (quizModel.js)                           │ │ │
│  │  │  - userId, quizType, questions                      │ │ │
│  │  │  - answers, timeLimit, createdAt                     │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Tech Model (techModel.js)                           │ │ │
│  │  │  - userId, problemId, title, description           │ │ │
│  │  │  - difficulty, testCases, createdAt                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Communication Model (communicationModel.js)         │ │ │
│  │  │  - userId, roundType, questions                      │ │ │
│  │  │  - responses, scores, createdAt                      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Score Model (scoreModel.js)                         │ │ │
│  │  │  - userId, candidateId, roundType                     │ │ │
│  │  │  - score, maxScore, percentage                       │ │ │
│  │  │  - timestamp, details                                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ┌──────────────────┐  ┌──────────────────┐             │ │
│  │  │ Google Generative │  │   ZEGOCLOUD      │             │ │
│  │  │ AI (Gemini 1.5)   │  │   Video SDK      │             │ │
│  │  │                   │  │                  │             │ │
│  │  │ - Resume Scoring  │  │ - HR Interviews  │             │ │
│  │  │ - Quiz Generation │  │ - Video Calls    │             │ │
│  │  │ - Tech Problems   │  │ - Screen Share   │             │ │
│  │  │ - Communication   │  │ - Chat           │             │ │
│  │  │   Questions       │  │                  │             │ │
│  │  │ - Code Evaluation  │  │                  │             │ │
│  │  └──────────────────┘  └──────────────────┘             │ │
│  │                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────┐             │ │
│  │  │   Cloudinary      │  │  Email Services  │             │ │
│  │  │   (Image Storage) │  │  (@emailjs)      │             │ │
│  │  │                   │  │                  │             │ │
│  │  │ - Screenshot      │  │ - Notifications  │             │ │
│  │  │   Storage         │  │ - Invitations    │             │ │
│  │  │ - Resume Files    │  │ - Results        │             │ │
│  │  └──────────────────┘  └──────────────────┘             │ │
│  │                                                            │ │
│  │  ┌──────────────────┐                                    │ │
│  │  │  GeeksforGeeks    │                                    │ │
│  │  │  (Web Scraping)   │                                    │ │
│  │  │                   │                                    │ │
│  │  │ - Quiz Questions  │                                    │ │
│  │  │   Source          │                                    │ │
│  │  └──────────────────┘                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Components

### 1. Frontend Layer (Client-Side)

#### Technology Stack:
- **Framework**: React.js 18.3.1
- **Build Tool**: Vite 5.4.10
- **Styling**: Tailwind CSS 3.4.15
- **Routing**: React Router DOM 7.0.1
- **State Management**: React Hooks (useState, useEffect, useContext)
- **HTTP Client**: Axios 1.7.7

#### Key Modules:

**1.1 Authentication Module**
- `Login.jsx` - User authentication
- `Signup.jsx` - User registration
- `ProtectedRoute.jsx` - Route guard for authenticated users
- `PublicOnlyRoute.jsx` - Route guard for public pages

**1.2 Core Pages**
- `MainPage.jsx` - Landing page
- `Recruiter.jsx` - Recruiter dashboard
- `Dashboard.jsx` - Analytics and candidate management
- `AllJobs.jsx` - Job listings
- `JobApplication.jsx` - Candidate job application

**1.3 Assessment Modules**
- `QuizRound.jsx` - Aptitude test with proctoring (face-api.js)
- `TechRound.jsx` - Coding assessment
- `TechnicalInfo.jsx` - Technical round configuration
- `AptitudeInfo.jsx` - Aptitude round configuration
- `CommunicationRound.jsx` - Communication assessment
- `CommunicationInfo.jsx` - Communication round configuration

**1.4 HR Interview Module**
- `HRRound.jsx` - Video interview (ZEGOCLOUD integration)
- `HRRoundEntrance.jsx` - Interview entry point
- `HrRoundInfo.jsx` - HR round configuration

**1.5 Utility Components**
- `Navbar.jsx` - Navigation bar
- Email components (CheatingEmail, CommunicationEmail, HRemail, etc.)
- `candidateDetails.jsx` - Candidate information display

**1.6 Client-Side Libraries**
- **face-api.js** (0.22.2): Real-time face detection for proctoring
- **pdfjs-dist** (4.8.69): PDF parsing for resume extraction
- **@zegocloud/zego-uikit-prebuilt** (2.13.2): Video conferencing
- **@emailjs/browser** (4.4.1): Email notifications

---

### 2. Backend Layer (Server-Side)

#### Technology Stack:
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.1
- **Database**: MongoDB (via Mongoose 8.8.2)
- **Authentication**: bcrypt 5.1.1 (password hashing)
- **File Upload**: Multer 1.4.5-lts.1
- **HTTP Client**: node-fetch 2.6.7

#### API Structure:

**2.1 Authentication Routes** (`/routes/auth/`)
- `signup.js` - User registration with password hashing
- `login.js` - User authentication
- `updateUser.js` - User profile updates
- `getUserInfo.js` - Fetch user details

**2.2 Job Management Routes** (`/routes/jobs/`)
- `createJob.js` - Create new job posting
- `allJob.js` - List all jobs
- `getJob.js` - Get specific job details
- `updateJob.js` - Update job information
- `deleteJob.js` - Delete job posting
- `jobs.js` - Get jobs by recruiter

**2.3 Resume Processing Routes** (`/routes/resume/`)
- `scanResume.js` - AI-powered resume scoring using Gemini
- `getExcelFile.js` - Generate Excel reports

**2.4 AI Generation Routes** (`/routes/ai/`)
- `generateQuiz.js` - Generate aptitude questions (Gemini + GeeksforGeeks)
- `generateTech.js` - Generate coding problems (Gemini)
- `generateCommunication.js` - Generate communication questions (Gemini)
- `generateReadAndSpeak.js` - Generate read-and-speak questions (Gemini)
- `generateListenAndSpeak.js` - Generate listen-and-speak questions (Gemini)
- `generateTopicAndSpeech.js` - Generate topic-and-speech questions (Gemini)
- `checkTechSolution.js` - Evaluate code solutions (Gemini)

**2.5 Assessment Management Routes** (`/routes/assessments/`)
- `addQuiz.js` - Save quiz questions
- `getQuiz.js` - Retrieve quiz questions
- `addTech.js` - Save technical problems
- `getTech.js` - Retrieve technical problems
- `addCommunication.js` - Save communication questions
- `getCommunication.js` - Retrieve communication questions
- `allCommunication.js` - List all communication assessments

**2.6 Scoring & Analytics Routes** (`/routes/scoring/`)
- `addScore.js` - Record candidate scores
- `allScores.js` - Get all scores for recruiter
- `cheatingDetected.js` - Log cheating incidents
- `uploadScreenshot.js` - Upload proctoring screenshots

**2.7 User Management Routes** (`/routes/users/`)
- `allUser.js` - List all users
- `deleteUser.js` - Delete user account

**2.8 Utility Services** (`/utils/`)
- `excelUtils.js` - Excel file generation
- `uploadImage.js` - Cloudinary image upload
- `deepseek.js` - Alternative AI service integration

---

### 3. Data Layer

#### Database: MongoDB

**3.1 User Collection** (`userModel.js`)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // 'recruiter' | 'candidate'
  createdAt: Date,
  updatedAt: Date
}
```

**3.2 Job Collection** (`jobModel.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  jobRole: String,
  description: String,
  requirements: Array,
  location: String,
  salary: String,
  createdAt: Date,
  updatedAt: Date
}
```

**3.3 Quiz Collection** (`quizModel.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  quizType: String, // 'logical', 'verbal', 'quantitative'
  questions: Array,
  answers: Array,
  timeLimit: Number,
  createdAt: Date
}
```

**3.4 Technical Problems Collection** (`techModel.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  problemId: String,
  title: String,
  description: String,
  difficulty: String, // 'easy', 'medium', 'hard'
  testCases: Array,
  createdAt: Date
}
```

**3.5 Communication Collection** (`communicationModel.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  roundType: String, // 'readAndSpeak', 'listenAndSpeak', 'topicAndSpeech'
  questions: Array,
  responses: Array,
  scores: Array,
  createdAt: Date
}
```

**3.6 Scores Collection** (`scoreModel.js`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  candidateId: ObjectId (ref: User),
  roundType: String, // 'aptitude', 'technical', 'communication', 'hr'
  score: Number,
  maxScore: Number,
  percentage: Number,
  details: Object,
  timestamp: Date
}
```

---

### 4. External Services Integration

#### 4.1 Google Generative AI (Gemini 1.5 Flash)
- **Purpose**: AI-powered content generation and evaluation
- **Use Cases**:
  - Resume semantic analysis and scoring
  - Quiz question generation
  - Technical problem generation
  - Communication question generation
  - Code solution evaluation
- **Integration**: REST API via `@google/generative-ai` package

#### 4.2 ZEGOCLOUD Video SDK
- **Purpose**: Real-time video interviews
- **Features**:
  - Video conferencing
  - Screen sharing
  - Chat functionality
  - Recording capabilities
- **Integration**: Client-side via `@zegocloud/zego-uikit-prebuilt`

#### 4.3 Cloudinary
- **Purpose**: Image and file storage
- **Use Cases**:
  - Proctoring screenshots
  - Resume file storage
- **Integration**: Server-side via `cloudinary` package

#### 4.4 Email Services (@emailjs/browser)
- **Purpose**: Automated email notifications
- **Use Cases**:
  - Interview invitations
  - Assessment results
  - Cheating alerts
  - Round progression notifications
- **Integration**: Client-side via `@emailjs/browser`

#### 4.5 GeeksforGeeks (Web Scraping)
- **Purpose**: Quiz question source
- **Integration**: Server-side web scraping via `node-fetch` and `cheerio`

---

## Data Flow Architecture

### 1. User Registration Flow
```
User → Frontend (Signup.jsx) 
  → POST /signup 
  → Backend (signup.js) 
  → Password Hashing (bcrypt) 
  → MongoDB (User Collection) 
  → Response → Frontend 
  → Redirect to Login
```

### 2. Resume Processing Flow
```
Candidate → Frontend (JobApplication.jsx) 
  → PDF Upload (pdfjs-dist) 
  → Extract Text 
  → POST /scanResume 
  → Backend (scanResume.js) 
  → Google Gemini AI (Resume Analysis) 
  → Score Calculation 
  → MongoDB (Score Collection) 
  → Excel Generation (excelUtils.js) 
  → Response → Frontend Dashboard
```

### 3. Quiz Generation Flow
```
Recruiter → Frontend (AptitudeInfo.jsx) 
  → GET /generateQuiz?quizType=logical&source=gfg 
  → Backend (generateQuiz.js) 
  → GeeksforGeeks Scraping (if source=gfg) 
  → Google Gemini AI (Question Generation) 
  → Response → Frontend 
  → Save to MongoDB (Quiz Collection)
```

### 4. Proctoring Flow
```
Candidate → Frontend (QuizRound.jsx) 
  → Webcam Access 
  → face-api.js (Real-time Detection) 
  → Face Detection Loop (1 second intervals) 
  → Multiple Face Detection → Screenshot Capture 
  → POST /uploadScreenshot 
  → POST /cheatingDetected 
  → Backend → MongoDB (Log Incident) 
  → Email Notification (@emailjs)
```

### 5. HR Interview Flow
```
Recruiter → Frontend (HRRound.jsx) 
  → Generate Meeting Link (ZEGOCLOUD) 
  → Share Link with Candidate 
  → Candidate Joins (HRRound.jsx) 
  → ZEGOCLOUD Video SDK 
  → Real-time Video/Audio 
  → Recording (Optional) 
  → Facial Behavior Analysis (HRFacialAnalysis.jsx)
    → face-api.js Emotion Detection
    → Real-time Emotion Classification
    → Communication Clarity Calculation
  → POST /addHRInterviewAnalysis
  → Backend (addHRInterviewAnalysis.js)
  → POST /addScore (roundName: "hr")
  → MongoDB (Score Collection with HR Analysis)
```

### 6. Code Evaluation Flow
```
Candidate → Frontend (TechRound.jsx) 
  → Code Submission 
  → POST /checkTechSolution 
  → Backend (checkTechSolution.js) 
  → Google Gemini AI (Code Analysis) 
  → Test Case Evaluation 
  → Score Calculation 
  → Response → Frontend 
  → Save to MongoDB (Score Collection)
```

---

## Security Architecture

### 1. Authentication & Authorization
- **Password Security**: bcrypt hashing (salt rounds: 10)
- **Session Management**: localStorage (client-side)
- **Route Protection**: ProtectedRoute component (client-side)
- **CORS Configuration**: Whitelisted origins (server-side)

### 2. Data Security
- **Input Validation**: Express middleware
- **SQL Injection Prevention**: MongoDB (NoSQL, parameterized queries)
- **XSS Prevention**: React's built-in escaping
- **HTTPS**: Enforced in production

### 3. Proctoring Security
- **Face Detection**: Real-time monitoring (face-api.js)
- **Screenshot Capture**: Automatic on suspicious activity
- **Activity Logging**: All events stored in MongoDB
- **Cheating Alerts**: Immediate email notifications

---

## Scalability Considerations

### 1. Modular Design
- **Separation of Concerns**: Clear layer separation
- **Independent Modules**: Each route handler is independent
- **Reusable Components**: Shared utilities and components

### 2. Database Optimization
- **Indexing**: MongoDB indexes on frequently queried fields
- **Data Normalization**: Proper schema design
- **Query Optimization**: Efficient MongoDB queries

### 3. Caching Strategy
- **Client-Side Caching**: React state management
- **API Response Caching**: Can be implemented with Redis (future)

### 4. Load Balancing (Future)
- **Horizontal Scaling**: Multiple server instances
- **Microservices Transition**: Split into independent services
- **Containerization**: Docker deployment (future)

---

## Deployment Architecture

### Current Deployment:
- **Frontend**: Vite build → Static hosting (Vercel/Netlify)
- **Backend**: Node.js → Server hosting (Vercel/Railway)
- **Database**: MongoDB Atlas (Cloud)

### Environment Configuration:
```
Frontend (.env.local):
- VITE_BACKEND_URL
- VITE_ZEGO_APP_ID
- VITE_ZEGO_SERVER_SECRET

Backend (.env):
- MONGODB_URI
- GEN_AI_API_KEY
- PORT
- FRONTEND_URL
- CLOUDINARY_URL
```

---

## API Endpoint Summary

### Authentication Endpoints
- `POST /signup` - User registration
- `POST /login` - User authentication
- `PUT /updateUser` - Update user profile
- `GET /getUserInfo/:userId` - Get user information

### Job Management Endpoints
- `POST /createJob` - Create job posting
- `GET /allJob` - List all jobs
- `GET /getJob/:jobId` - Get job details
- `PUT /updateJob/:jobId` - Update job
- `DELETE /deleteJob/:jobId` - Delete job
- `GET /jobs/:userId` - Get jobs by recruiter

### Resume Processing Endpoints
- `POST /scanResume` - AI resume scoring
- `GET /getExcelFile/:userId` - Download Excel report

### AI Generation Endpoints
- `GET /generateQuiz?quizType=...&source=...` - Generate quiz
- `GET /generateTech?techType=...` - Generate tech problems
- `GET /generateComm?prompt=...` - Generate communication questions
- `GET /generateReadAndSpeak?prompt=...` - Generate read-and-speak
- `GET /generateListenAndSpeak?prompt=...` - Generate listen-and-speak
- `GET /generateTopicAndSpeech?prompt=...` - Generate topic-and-speech
- `POST /checkTechSolution` - Evaluate code

### Assessment Endpoints
- `POST /addQuiz` - Save quiz
- `GET /getQuiz/:userId` - Get quiz
- `POST /addTech` - Save tech problem
- `GET /getTech/:userId` - Get tech problems
- `POST /addCommunication` - Save communication assessment
- `GET /getCommunication/:userId` - Get communication assessment
- `GET /allCommunication/:userId` - List all communication assessments

### Scoring Endpoints
- `POST /addScore` - Record score
- `GET /allScores/:userId` - Get all scores
- `POST /cheatingDetected` - Log cheating
- `POST /uploadScreenshot` - Upload screenshot

### User Management Endpoints
- `GET /allUser` - List all users
- `DELETE /deleteUser/:userId` - Delete user

---

## Technology Stack Summary

### Frontend
- React.js 18.3.1
- Vite 5.4.10
- Tailwind CSS 3.4.15
- React Router DOM 7.0.1
- Axios 1.7.7
- face-api.js 0.22.2
- pdfjs-dist 4.8.69
- @zegocloud/zego-uikit-prebuilt 2.13.2

### Backend
- Node.js
- Express.js 4.21.1
- MongoDB (Mongoose 8.8.2)
- bcrypt 5.1.1
- @google/generative-ai 0.21.0
- multer 1.4.5-lts.1
- node-fetch 2.6.7
- cloudinary 2.5.1

### External Services
- Google Generative AI (Gemini 1.5 Flash)
- ZEGOCLOUD Video SDK
- Cloudinary
- EmailJS
- MongoDB Atlas

---

## Future Enhancements

1. **Microservices Migration**: Split monolithic backend into independent services
2. **Redis Caching**: Implement caching layer for improved performance
3. **WebSocket Integration**: Real-time updates for dashboard
4. **Docker Containerization**: Container-based deployment
5. **Kubernetes Orchestration**: Container orchestration for scaling
6. **API Rate Limiting**: Prevent abuse and ensure fair usage
7. **Advanced Analytics**: Machine learning-based candidate ranking
8. **Multi-language Support**: Internationalization (i18n)
9. **Mobile App**: React Native mobile application
10. **Blockchain Integration**: Immutable candidate records (optional)

---

*This architecture document reflects the current implementation of SmartHire-X as of the latest codebase analysis.*


