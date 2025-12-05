# Quick Start Guide - SmartHire-X

## ✅ Setup Complete!

The project dependencies have been installed and servers are starting.

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## ⚙️ Environment Variables Required

### Backend (.env)
Make sure `backend/.env` contains:
```env
MONGODB_URI=mongodb://localhost:27017/smartrecruit
PORT=4000
FRONTEND_URL=http://localhost:5173
GEN_AI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
Make sure `frontend/.env` contains:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_FRONTEND_URL=http://localhost:5173
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_secret
```

## 🚀 Starting the Servers

### Option 1: Using PowerShell Script
```powershell
.\start.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📋 Prerequisites Checklist

- [x] Node.js installed
- [x] Dependencies installed
- [ ] MongoDB running (local or Atlas)
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Google Gemini API key
- [ ] Cloudinary credentials (for image uploads)
- [ ] ZEGOCLOUD credentials (for HR video interviews)
- [ ] Face-api.js emotion models (for HR interview analysis)

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check MongoDB Atlas connection
- Verify `MONGODB_URI` in `backend/.env`

### Port Already in Use
- Change `PORT` in `backend/.env` (default: 4000)
- Update `VITE_BACKEND_URL` in `frontend/.env` accordingly

### Face-API Models Missing
- Download from: https://github.com/justadudewhohacks/face-api.js-models
- Place in: `frontend/public/models/`
- Required: `face_expression_model-weights_manifest.json` and `face_expression_model-shard1`

### API Key Errors
- Verify all API keys in `.env` files
- Check API key permissions and quotas
- Ensure no extra spaces in `.env` values

## 📚 Additional Resources

- Full Setup Guide: See `SETUP_GUIDE.md`
- System Architecture: See `SYSTEM_ARCHITECTURE.md`
- Proposed Methodology: See `PROPOSED_METHODOLOGY.md`

## 🎯 Next Steps

1. **Configure Environment Variables**: Update `.env` files with your API keys
2. **Start MongoDB**: Ensure MongoDB is running
3. **Access Application**: Open http://localhost:5173 in your browser
4. **Create Account**: Sign up as a recruiter to start using the system

---

**Note**: The servers are currently running in the background. Check the terminal windows for any errors or logs.

