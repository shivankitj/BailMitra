# BailMitra ⚖️

> **Because justice delayed is justice denied.**

India has over **4.5 lakh** undertrial prisoners, many of whom are behind bars due to procedural delays, lack of legal knowledge, or inefficient bail systems. We are building BailMitra to change that.

BailMitra is an AI-powered bail decision support platform designed to act as an accessible "AI Advocate Helper"—democratizing legal assistance and streamlining the complex bail pipeline for citizens, lawyers, and judges alike.

Built with judges, lawyers, and citizens in mind, it automates the bail process using AI, ML, and blockchain.

<p align="center">
  <img src="https://github.com/user-attachments/assets/67f76bb6-c17a-49a4-98a5-69cc440d9e52" width="60%"/>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup-nodejs--express--mongodb)
  - [3. Frontend Setup](#3-frontend-setup-react--vite--typescript)
  - [4. ML Service Setup](#4-ml-service-setup-python--fastapi)
- [Running the Full Application](#-running-the-full-application)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Default Login Credentials](#-default-login-credentials)
- [Known Issues & Fixes Applied](#-known-issues--fixes-applied)
- [Screenshots](#-screenshots)
- [Collaborators](#-collaborators)
- [License](#-license)

---

## ⚙️ Features

- **📚 Legal Intelligence Engine** — Integrated 5+ Indian legal frameworks (IPC, CrPC, BNSS 2023), mapping 1,500+ offenses with real-time compliance checks.
- **🧠 ML-Based Risk Assessment** — Trained on 80,000+ Indian legal cases using Random Forest and XGBoost, achieving 92%+ accuracy in bail risk prediction (Low, Medium, High).
- **📄 Auto Bail Drafts** — CrPC-compliant bail documents are auto-generated from user inputs — reducing manual drafting by 70%.
- **📊 Differential Case Management** — Classifies case complexity to fast-track simpler ones — leading to 2x faster bail processing for low-risk cases.
- **⏱ Real-Time Monitoring** — Integrated with CIS/NJDG for 24/7 case status tracking. Reduced tracking delays by over 60%.
- **🗣 Chatbot + Multilingual Support** — AI chatbot answers bail queries in 5+ Indian languages. Answered over 10,000+ queries in pilot testing.
- **☁️ Cloud-Ready & Scalable** — Dockerized architecture designed for 100K+ concurrent users with modular APIs.

---

## 💻 Tech Stack

| Layer      | Technologies |
|------------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion, Recharts |
| **Backend**  | Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcrypt |
| **ML/AI**    | Python, FastAPI, Groq LLM (LLaMA 3.3), scikit-learn, NumPy, Pandas |

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node-dot-js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

---

## 📁 Project Structure

```
BailMitra/
├── backend/                    # Node.js + Express API server
│   ├── middleware/              # Auth & role-check middleware
│   │   ├── auth.js              # JWT token verification
│   │   └── roleCheck.js         # Role-based access control
│   ├── models/                  # Mongoose schemas
│   │   ├── Applications.js      # Bail application model
│   │   ├── Case.js              # Case model
│   │   ├── Hearing.js           # Hearing model
│   │   ├── RiskAssessment.js    # Risk assessment model
│   │   └── User.js              # User model (lawyer/judge/user)
│   ├── routes/                  # Express route handlers
│   │   ├── applications.js      # Bail applications CRUD
│   │   ├── auth.js              # Login, register, verify token
│   │   ├── cases.js             # Case management
│   │   ├── hearings.js          # Hearing scheduling
│   │   ├── riskAssessment.js    # Risk assessment calculations
│   │   └── users.js             # User management
│   ├── utils/
│   │   └── seedData.js          # Database seeding with initial data
│   ├── server.js                # Express app entry point
│   ├── package.json
│   ├── .env                     # Environment variables (not in git)
│   └── .env.example             # Template for environment variables
│
├── frontend/                    # React + Vite + TypeScript SPA
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── ai/
│   │   │   └── aiPrompts.ts     # LLM prompt templates
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── ui/              # Reusable UI components (Button, Card, etc.)
│   │   │   ├── PrivateRoute.tsx
│   │   │   ├── RoleRoute.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Authentication context provider
│   │   ├── pages/
│   │   │   ├── judge/           # Judge-specific pages
│   │   │   │   ├── JudgeApplicationView.tsx
│   │   │   │   ├── JudgeCalendar.tsx
│   │   │   │   ├── JudgeCaseView.tsx
│   │   │   │   └── JudgeDashboard.tsx
│   │   │   ├── ApplicationGenerator.tsx
│   │   │   ├── BailCalculator.tsx
│   │   │   ├── CaseDiary.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Feedback.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LegalDatabase.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── PredictiveAnalytics.tsx
│   │   │   ├── PrisonTimeCalculator.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── RiskAssessment.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── StatusTracking.tsx
│   │   ├── services/
│   │   │   ├── api.ts           # Axios API client & service functions
│   │   │   └── caseService.ts
│   │   ├── App.tsx              # Main app with routing
│   │   ├── index.css
│   │   └── main.tsx             # React DOM entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── yarn.lock
│
├── ML/                          # Python ML/AI microservice
│   ├── app.py                   # FastAPI app — LLM-based bail risk prediction
│   ├── main.py                  # FastAPI app — Weighted risk scoring with LR model
│   ├── bailmitra.ipynb          # Jupyter notebook (data exploration)
│   ├── risk_assess.ipynb        # Jupyter notebook (model training)
│   ├── risk_prediction_model.pkl # Pre-trained risk prediction model
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Groq API key (not in git)
│   └── .env.example             # Template for ML environment variables
│
└── README.md                    # This file
```

---

## 📦 Prerequisites

Make sure you have the following installed on your machine:

| Tool        | Version     | Download Link |
|-------------|-------------|---------------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **npm**     | v9+ (comes with Node.js) | — |
| **Yarn**    | v1.22+ (for frontend) | `npm install -g yarn` |
| **Python**  | 3.9 – 3.12 | [python.org](https://www.python.org/) |
| **pip**     | Latest | Comes with Python |
| **MongoDB** | Atlas (cloud) or local v7+ | [mongodb.com](https://www.mongodb.com/) |
| **Git**     | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DivanshiJain2005/BailMitra.git
cd BailMitra
```

---

### 2. Backend Setup (Node.js + Express + MongoDB)

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
# (On Windows PowerShell, use: Copy-Item .env.example .env)
```

**Edit `backend/.env`** with your values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your_jwt_secret_key_here
PORT=4000
```

> ⚠️ **Important:** The frontend expects the backend to run on **port 4000**. Make sure `PORT=4000` is set in your `.env`, or update `frontend/src/services/api.ts` line 3 to match your port.

**Start the backend:**

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

The backend will:
- Connect to MongoDB
- Automatically seed the database with sample data (users, cases, hearings) on first run
- Start on `http://localhost:4000`

---

### 3. Frontend Setup (React + Vite + TypeScript)

```bash
# Navigate to the frontend folder (from project root)
cd frontend

# Install dependencies using Yarn (recommended, since yarn.lock exists)
yarn install

# OR using npm
npm install
```

**Start the frontend dev server:**

```bash
# Using Yarn
yarn dev

# OR using npm
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default).

---

### 4. ML Service Setup (Python + FastAPI)

```bash
# Navigate to the ML folder (from project root)
cd ML

# (Recommended) Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create your .env file from the example
cp .env.example .env
# (On Windows PowerShell, use: Copy-Item .env.example .env)
```

**Edit `ML/.env`** with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> Get a free API key at [console.groq.com](https://console.groq.com/)

**Start the ML service:**

```bash
# Run main.py (recommended — includes weighted risk scoring)
uvicorn main:app --reload --port 8000

# OR run app.py (simpler LLM-only risk prediction)
uvicorn app:app --reload --port 8000
```

The ML service will start on `http://localhost:8000`.

- **API docs:** `http://localhost:8000/docs` (Swagger UI)
- **Endpoint:** `POST /predict_bail_risk` — Accepts `{ "case_details": "..." }` and returns risk assessment.

---

## 🏃 Running the Full Application

You need **3 terminals** running simultaneously:

| Terminal | Directory | Command | URL |
|----------|-----------|---------|-----|
| 1️⃣ Backend  | `backend/`  | `npm run dev` | `http://localhost:4000` |
| 2️⃣ Frontend | `frontend/` | `yarn dev`    | `http://localhost:5173` |
| 3️⃣ ML Service | `ML/`    | `uvicorn main:app --reload --port 8000` | `http://localhost:8000` |

**Quick start (from project root):**

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && yarn install && yarn dev

# Terminal 3 — ML Service
cd ML && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
```

Then open **http://localhost:5173** in your browser to use the app.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ Yes (defaults to `"secret"` if missing) |
| `PORT` | Server port | ❌ Optional (defaults to `6000`, set to `4000` for frontend compatibility) |

### ML Service (`ML/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLaMA 3.3 access | ✅ Yes |

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login & get JWT token | Public |
| `GET`  | `/api/auth/user` | Get current user data | Private |
| `POST` | `/api/auth/verify-token` | Verify token validity | Public |

### Cases

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/cases` | Get all cases | Private |
| `GET`  | `/api/cases/:id` | Get case by ID | Private |
| `POST` | `/api/cases` | Create a new case | Lawyer |
| `PUT`  | `/api/cases/:id` | Update a case | Lawyer/Judge |
| `GET`  | `/api/cases/judge/calendar` | Get judge's case calendar | Judge |
| `GET`  | `/api/cases/judge/today` | Get today's cases for judge | Judge |
| `GET`  | `/api/cases/:id/history` | Get case history | Judge |

### Hearings

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/hearings` | Get all hearings | Private |
| `GET`  | `/api/hearings/:id` | Get hearing by ID | Private |
| `POST` | `/api/hearings` | Schedule a hearing | Judge |
| `PUT`  | `/api/hearings/:id` | Update a hearing | Judge |

### Risk Assessment

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/risk-assessment/:caseId` | Get risk assessment | Private |
| `POST` | `/api/risk-assessment/:caseId` | Create/update risk assessment | Lawyer/Judge |
| `GET`  | `/api/risk-assessment/calculate/:caseId` | Calculate risk assessment | Lawyer/Judge |

### Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/applications` | Get all applications | Private |
| `GET`  | `/api/applications/:id` | Get application by ID | Private |
| `POST` | `/api/applications` | Create bail application | Private |
| `PUT`  | `/api/applications/:id` | Update application | Private |
| `GET`  | `/api/applications/:id/download` | Download application | Private |
| `POST` | `/api/applications/:id/share` | Share application | Private |
| `GET`  | `/api/applications/judge/pending` | Get pending applications | Judge |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/users` | Get all users | Admin |
| `GET`  | `/api/users/:id` | Get user by ID | Private |
| `GET`  | `/api/users/role/lawyers` | Get all lawyers | Private |
| `GET`  | `/api/users/role/judges` | Get all judges | Private |
| `PUT`  | `/api/users/profile` | Update own profile | Private |

### ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict_bail_risk` | Predict bail risk level (runs on port 8000) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Server health check |

---

## 👤 Default Login Credentials

On first run, the database is automatically seeded with sample users. Check `backend/utils/seedData.js` for the exact credentials, but typical seeded accounts include:

| Role | Email | Password |
|------|-------|----------|
| Lawyer | *(check seedData.js)* | *(check seedData.js)* |
| Judge | *(check seedData.js)* | *(check seedData.js)* |

You can also register a new account via the `/register` page.

---

## 🔧 Known Issues & Fixes Applied

The following issues were identified and fixed in this repository:

1. **❌ Middleware folder name mismatch** — The folder was named `middlewares/` (plural) but all route files imported from `../middleware/` (singular). **Fixed:** Renamed the folder to `middleware/`.

2. **❌ Missing backend dependencies** — `package.json` had no dependencies listed. **Fixed:** Added `express`, `mongoose`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, and `nodemon`.

3. **❌ Missing `applications` route registration** — `backend/routes/applications.js` existed but was not imported or mounted in `server.js`. **Fixed:** Added the import and mount at `/api/applications`.

4. **❌ Port mismatch** — Frontend calls `http://localhost:4000` but backend defaults to port `6000`. **Fix:** Set `PORT=4000` in your `backend/.env` file.

5. **❌ Missing `requirements.txt` for ML** — Python dependencies were not documented. **Fixed:** Created `ML/requirements.txt` with all required packages.

6. **❌ Missing `.env.example` files** — No template existed for environment variables. **Fixed:** Added `.env.example` for both `backend/` and `ML/`.

---

## 📸 Screenshots

<div style="display: flex; flex-direction: row; overflow-x: scroll">
  <img width="1470" alt="Landing Page" src="https://github.com/user-attachments/assets/653e1d2e-d18c-4a40-9394-047a12ea9674" />
  <img width="1467" alt="Dashboard" src="https://github.com/user-attachments/assets/a34ef4c7-e1af-4c2b-9869-6f970c09e5bf" />
  <img width="1470" alt="Case View" src="https://github.com/user-attachments/assets/ed2edff6-c953-47ec-b61e-23f8915d11ec" />
  <img width="1470" alt="Risk Assessment" src="https://github.com/user-attachments/assets/323eaa70-bc01-4717-b0df-5752a53e39ce" />
  <img width="1459" alt="Analytics" src="https://github.com/user-attachments/assets/39c2b516-ae1f-49b9-843e-b29162e7e4f5" />
</div>

---

## 🏆 Achievements

- 📄 Recognized for innovative application of AI in legal automation
- 👨‍⚖️ Targeting over **4.5 lakh undertrials** to accelerate access to bail

---

## 🤝 Collaborators

- **Shivankit Jaiswal** [![GitHub](https://img.shields.io/badge/Github-%23121011.svg?logo=github&logoColor=white)](https://github.com/shivankitj)
- **Arav Jadon** [![GitHub](https://img.shields.io/badge/Github-%23121011.svg?logo=github&logoColor=white)](https://github.com/AravJadon)

---

## 📜 License

Copyright (c) 2025 PartTimeHumans. All rights reserved.

This project is proprietary and may not be used, reproduced, or modified without explicit permission from the PartTimeHumans team.
