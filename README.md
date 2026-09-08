# ResumeAI — Full-Stack AI Resume Analyzer

A modern MERN stack application that analyzes PDF resumes, calculates ATS scores, detects skills, and suggests improvements.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Backend   | Node.js + Express.js                |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (JSON Web Tokens) + bcryptjs    |
| Upload    | Multer (multipart/form-data)        |
| PDF Parse | pdf-parse                           |

---

## Project Structure

```
resume-analyzer/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreRing.jsx   # Circular ATS score display
│   │   │   ├── SkillBadge.jsx  # Skill tag component
│   │   │   └── ResumeCard.jsx  # Dashboard history card
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   └── ResultPage.jsx
│   │   ├── utils/
│   │   │   └── api.js          # Axios instance with JWT interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                     # Express backend
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── authController.js   # Register, login, getMe
    │   └── resumeController.js # Upload, analyze, history, delete
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification
    │   └── uploadMiddleware.js # Multer PDF upload config
    ├── models/
    │   ├── User.js             # User schema with password hashing
    │   └── Resume.js           # Resume + analysis schema
    ├── routes/
    │   ├── authRoutes.js
    │   └── resumeRoutes.js
    ├── utils/
    │   └── analyzeResume.js    # Rule-based ATS analyzer
    ├── uploads/                # Uploaded PDFs (auto-created)
    ├── .env
    └── index.js                # Server entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Setup the Backend

```bash
cd resume-analyzer/server
npm install
```

Copy the example env file and edit it:
```bash
cp .env.example .env
```

Start the server:
```bash
npm run dev
```

Server runs at: `http://localhost:5000`

### 2. Setup the Frontend

```bash
cd resume-analyzer/client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint             | Description          | Auth |
|--------|----------------------|----------------------|------|
| POST   | /api/auth/register   | Create account       | No   |
| POST   | /api/auth/login      | Login, get token     | No   |
| GET    | /api/auth/me         | Get current user     | Yes  |

### Resume
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /api/resume/upload    | Upload + analyze PDF     | Yes  |
| GET    | /api/resume/history   | Get all past analyses    | Yes  |
| GET    | /api/resume/:id       | Get single analysis      | Yes  |
| DELETE | /api/resume/:id       | Delete a resume          | Yes  |

---

## Features

- **JWT Authentication** — Secure signup/login with hashed passwords
- **PDF Upload** — Drag-and-drop with file validation (PDF only, max 5MB)
- **Text Extraction** — pdf-parse extracts raw text from uploaded PDFs
- **ATS Score** — Rule-based scoring (0–100) based on skills, keywords, structure
- **Skill Detection** — Matches 80+ tech skills across languages, frameworks, tools
- **Missing Skills** — Suggests high-value skills not found in the resume
- **Keyword Extraction** — Top 20 meaningful words from the resume
- **Analysis History** — Dashboard with all past analyses
- **Dark UI** — Modern glassmorphism design with Tailwind CSS

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```
