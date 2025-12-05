# SmartHire-X Setup Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

## Step 1: Environment Variables Setup

### Backend Environment Variables

1. Navigate to the `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and fill in the required values:
   - `MONGODB_URI`: Your MongoDB connection string
     - Local: `mongodb://localhost:27017/smartrecruit`
     - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/smartrecruit`
   - `GEN_AI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `CLOUDINARY_*`: Get from [Cloudinary Dashboard](https://cloudinary.com/console) (for image uploads)
   - `PORT`: Backend server port (default: 4000)

### Frontend Environment Variables

1. Navigate to the `frontend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and fill in:
   - `VITE_BACKEND_URL`: Backend server URL (default: http://localhost:4000)
   - `VITE_FRONTEND_URL`: Frontend URL (default: http://localhost:5173)
   - `VITE_ZEGO_APP_ID` & `VITE_ZEGO_SERVER_SECRET`: Get from [ZEGOCLOUD](https://www.zegocloud.com/) (for HR video interviews)

## Step 2: Install Dependencies

### Backend Dependencies

```bash
cd backend
npm install
```

### Frontend Dependencies

```bash
cd frontend
npm install
```

## Step 3: Face-API.js Models Setup

The facial recognition feature requires face-api.js models. Check if models exist in `frontend/public/models/`:

Required models:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_expression_model-weights_manifest.json` (for HR interview analysis)
- `face_expression_model-shard1` (for HR interview analysis)

If models are missing, download them from:
- [face-api.js models](https://github.com/justadudewhohacks/face-api.js-models)

Place all model files in `frontend/public/models/` directory.

## Step 4: Start MongoDB

### Local MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### MongoDB Atlas:
No local setup needed. Just use your Atlas connection string in `.env`.

## Step 5: Run the Application

### Terminal 1 - Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npx nodemon index.js
```

Backend will run on: `http://localhost:4000`

### Terminal 2 - Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Step 6: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_BACKEND_URL` in frontend `.env` accordingly

### Face-API Models Not Loading
- Ensure models are in `frontend/public/models/`
- Check browser console for model loading errors
- Download missing models from the face-api.js repository

### API Key Issues
- Verify all API keys are correctly set in `.env`
- Check API key permissions and quotas
- Ensure no extra spaces in `.env` file

## Required API Keys

1. **Google Gemini API**: [Get API Key](https://makersuite.google.com/app/apikey)
2. **Cloudinary**: [Sign Up](https://cloudinary.com/users/register/free) (for image uploads)
3. **ZEGOCLOUD**: [Sign Up](https://www.zegocloud.com/) (for HR video interviews)

## Development Notes

- Backend uses `nodemon` for auto-reload during development
- Frontend uses Vite for fast HMR (Hot Module Replacement)
- All environment variables are loaded from `.env` files
- Never commit `.env` files to version control

