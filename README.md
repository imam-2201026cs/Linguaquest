# 🏆 LinguaQuest — AI-Powered English Learning Platform

A fully gamified English communication platform built with **React + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend), powered by **Groq AI (Llama 3)**.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| ✍️ **Writing** | Choose topics, write essays/paragraphs, get detailed AI scoring on grammar, vocabulary, coherence, and content |
| 🎧 **Listening** | AI-generated passages read aloud via browser TTS, followed by comprehension quizzes |
| 📖 **Reading** | AI-generated reading passages with comprehension, inference, and vocabulary questions |
| ✅ **Grammar** | Paste any text to get error-by-error AI analysis + a separate Grammar Quiz mode |
| 🗣️ **AI Conversation** | **New!** Real-time AI chat for Everyday Roleplay and Career Success. Upload resumes (PDF/TXT) for personalized mock interviews with unique AI personas. |
| 🧠 **Vocabulary Builder** | **New!** Spaced-repetition flashcard system (swipe left/right) and saved word library to master new vocabulary. |
| 🎯 **Daily Challenge** | **New!** 10-question daily AI-generated quiz covering mixed English skills with a live leaderboard. |
| 🏆 **Leaderboard** | Global XP rankings with podium display |
| 👤 **Profile** | Achievements, stats, level progress, and activity history |

## 🎮 Gamification
- **XP System** — Earn XP for every activity based on score
- **Levels** — Automatically level up as you accumulate XP
- **Coins** — Earn coins alongside XP
- **Streaks** — Daily streak tracking on login
- **Achievements** — 15 unlockable achievements across all modules
- **Leaderboard** — Compete with other learners globally
- **XP Reward Popup** — Celebratory popup with confetti after each activity

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- React Router DOM v6
- Tailwind CSS 3
- Axios
- Lucide React icons
- React Hot Toast

**Backend:**
- Node.js + Express (ES Modules)
- MongoDB + Mongoose
- Groq SDK (Llama 3.3-70b & 3.1-8b)
- JWT Authentication
- bcryptjs

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/english_app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GROQ_API_KEY=your_groq_api_key_here
```

**Get your Groq API Key:**
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Click "Create API Key"
3. Copy it into `.env`

### 3. Start MongoDB

```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 4. Run the App

**Backend** (in `/backend`):
```bash
npm run dev
# Runs on http://localhost:5000
```

**Frontend** (in `/frontend`):
```bash
npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser!

---

## 📁 Project Structure

```
english-app/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with XP, streak, achievements
│   │   └── Activity.js      # Activity tracking schema
│   ├── middleware/
│   │   ├── auth.js          # JWT middleware
│   │   └── groq.js          # Groq AI helper
│   ├── routes/
│   │   ├── auth.js          # Register/Login
│   │   ├── user.js          # Profile, history, stats
│   │   ├── writing.js       # Writing topics + AI evaluation
│   │   ├── listening.js     # AI passage generation + quiz
│   │   ├── reading.js       # AI reading + comprehension
│   │   ├── grammar.js       # Grammar checker + quiz
│   │   ├── conversation.js  # Real-time chat & resume parsing via multer/pdf-parse
│   │   ├── vocabulary.js    # Flashcards & spaced-repetition logic
│   │   ├── challenge.js     # Daily challenge generation & submission
│   │   └── leaderboard.js   # Global rankings
│   ├── server.js
│   └── package.json         # type: "module"
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx   # Sidebar navigation
    │   │   └── XPReward.jsx # Gamified reward popup
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Writing.jsx
    │   │   ├── Listening.jsx
    │   │   ├── Reading.jsx
    │   │   ├── Grammar.jsx
    │   │   ├── Conversation.jsx # Interactive chat interface & setup modals
    │   │   ├── Vocabulary.jsx   # Swipeable flashcards
    │   │   ├── DailyChallenge.jsx # Timed quiz UI
    │   │   ├── Leaderboard.jsx
    │   │   └── Profile.jsx
    │   ├── App.jsx           # Router setup
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── vite.config.js        # Proxy to backend
    └── package.json          # type: "module"
```

---

## 🔑 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + streak update |
| GET | `/api/user/profile` | Get user profile |
| GET | `/api/user/history` | Get activity history |
| GET | `/api/writing/topics` | Get writing topics |
| POST | `/api/writing/submit` | Submit writing for AI evaluation |
| POST | `/api/listening/generate` | Generate AI listening exercise |
| POST | `/api/listening/submit` | Submit listening answers |
| POST | `/api/reading/generate` | Generate AI reading exercise |
| POST | `/api/reading/submit` | Submit reading answers |
| POST | `/api/grammar/check` | Grammar check with AI |
| POST | `/api/grammar/quiz/generate` | Generate grammar quiz |
| POST | `/api/conversation/start` | Start everyday roleplay session |
| POST | `/api/conversation/professional/start` | Start professional mock interview |
| POST | `/api/conversation/resume/parse` | Extract summary/skills from uploaded PDF/TXT |
| POST | `/api/conversation/message` | Send message to AI & get reply |
| GET | `/api/vocabulary` | Get words due for review |
| POST | `/api/vocabulary/review` | Submit spaced-repetition result |
| GET | `/api/challenge/daily` | Get today's 10-question challenge |
| POST | `/api/challenge/submit` | Submit challenge answers |
| GET | `/api/leaderboard` | Get global leaderboard |

---

## 🎨 Design Features

- **Dark theme** with deep navy/slate color palette
- **Glass morphism** cards with backdrop blur
- **Gradient accents** across all modules
- **Animated progress bars** with spring easing
- **XP reward popup** with confetti particles
- **Responsive** — works on mobile and desktop
- **Custom scrollbar** styling

---

## 🐛 Troubleshooting

**"Failed to generate exercise"** — Check your Groq API key in `.env`

**MongoDB connection error** — Ensure MongoDB is running locally or check Atlas URI

**CORS error** — Make sure backend is running on port 5000 and frontend on 5173

**Port in use** — Change PORT in `.env` and update proxy in `vite.config.js`
