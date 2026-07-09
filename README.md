# FINTELLI AI — Smart Personal Finance Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini AI-4285F4?style=flat-square&logo=google-gemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat-square&logo=groq&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-FF6384?style=flat-square&logo=chart.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
</p>

<p align="center">
  An AI-powered personal finance management platform built with the PERN stack.<br/>
  Track expenses, manage budgets, visualize financial trends, and receive intelligent spending insights<br/>
  powered by Google Gemini AI — with a Groq-powered Ask AI mini chatbot for instant finance Q&A.
</p>

<p align="center">
  <a href="https://fintelli-ai.vercel.app/"><img src="https://img.shields.io/badge/Live App-111827?style=flat-square&logo=vercel&logoColor=white" /></a>
  &nbsp;
  <a href="https://fintelli-ai-backend.onrender.com"><img src="https://img.shields.io/badge/Backend API-16A34A?style=flat-square&logo=node.js&logoColor=white" /></a>
  &nbsp;
  <a href="https://github.com/venkata-arjun/fintelli-ai"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Live Links](#live-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Dashboard Modules](#dashboard-modules)
- [AI Features](#ai-features)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Application Flow](#application-flow)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Developer](#developer)

---

## Overview

FINTELLI AI is an intelligent personal finance management platform designed to simplify expense tracking and financial planning.

Users can organize transactions, create budgets, analyze spending behavior, monitor financial health through interactive dashboards, and receive AI-generated recommendations for smarter money management.

The application combines modern UI design with real-time analytics and dual AI integration — Google Gemini AI for deep financial insights and Groq for a fast, responsive Ask AI chatbot embedded in the profile page.

---

## Live Links

| Service | URL |
|---|---|
| Live App | https://fintelli-ai.vercel.app |
| Backend API | https://fintelli-ai-backend.onrender.com |
| GitHub | https://github.com/venkata-arjun/fintelli-ai |

---

## Features

### Authentication

- Secure JWT-based authentication
- Protected routes
- User profile management
- Password update
- Persistent login sessions

### Dashboard

- Net balance overview
- Total income and expenses
- Savings rate indicator
- Monthly analytics
- Expense distribution charts
- Budget overview
- Recent transactions list

### Transaction Management

- Add income and expense entries
- Edit and delete transactions
- Search transactions
- Filter by date, category, and type
- Monthly and yearly analytics

### Categories

- Create, edit, and delete categories
- Default income and expense categories
- Custom category creation

### Budget Management

- Monthly budget planning
- Budget progress tracking
- Remaining budget display
- Spending percentage indicator
- AI budget analysis

### AI Insights

Powered by Google Gemini AI

- Spending pattern analysis
- Saving opportunity identification
- Personalized financial recommendations
- Monthly financial summaries
- Budget optimization suggestions
- Category-wise spending review

### Ask AI — Mini Finance Chatbot

Powered by Groq, embedded in the Profile page

- Ask any finance-related question in natural language
- Instant AI responses via Groq's fast inference
- Budget advice, saving tips, expense explanations
- Financial health Q&A on demand

---

## Tech Stack

**Frontend**

| Tool | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP requests |
| Recharts | Data visualization |
| Framer Motion | Animations |
| date-fns | Date formatting and utilities |
| Lucide React | Icon library |
| React Hot Toast | Notifications |

**Backend**

| Tool | Purpose |
|---|---|
| Node.js + Express.js v5 | Server and REST API |
| PostgreSQL (Neon) + pg | Database and query client |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Gemini AI (@google/genai) | AI insights and recommendations |
| Groq SDK | Ask AI mini chatbot (Profile page) |

**Deployment**

| Service | Usage |
|---|---|
| Vercel | Frontend |
| Render | Backend API |
| Neon (PostgreSQL) | Cloud database |

---

## Architecture

```
┌──────────────────────────────────┐
│        React Frontend            │
└─────────────────┬────────────────┘
                  │  Axios  REST API
┌─────────────────▼────────────────┐
│     Express + Node.js  Server    │
└──────┬──────────────────┬────────┘
       │                  │
  ┌────▼──────┐   ┌───────▼──────────────────────┐
  │ PostgreSQL│   │  AI Layer                     │
  │  (Neon)  │   │  Gemini AI — Insights          │
  └───────────┘   │  Groq      — Ask AI Chatbot   │
                  └──────────────────────────────┘
```

---

## Dashboard Modules

### Home
- Animated landing page with AI hero section
- Authentication entry point

### Dashboard
- Financial summary cards
- Income vs expense charts
- Spending distribution
- Budget overview

### Transactions
- CRUD operations
- Advanced search and filters
- Monthly and yearly analytics

### Categories
- Category organization
- Custom and default categories

### Budgets
- Budget tracking and progress
- AI-powered budget recommendations

### AI Insights
- Gemini AI monthly spending analysis
- Personalized saving tips
- Category-wise spending review

### Profile
- Personal information and account statistics
- Password management
- **Ask AI** — Groq-powered mini finance chatbot for on-demand Q&A

---

## AI Features

FINTELLI AI integrates two AI providers, each serving a distinct purpose:

**Google Gemini AI — AI Insights**
Analyzes the user's full transaction and budget data to surface spending patterns, flag overspending categories, and generate monthly financial summaries with personalized recommendations.

**Groq — Ask AI Chatbot (Profile Page)**
A lightweight, fast mini chatbot embedded in the profile page. Users can type any finance-related question — budgeting advice, savings strategies, expense explanations — and receive near-instant answers powered by Groq's high-speed inference.

---

## Folder Structure

```
fintelli-ai/
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── charts/
│       │   ├── ui/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   └── Layout.jsx
│       ├── context/
│       ├── pages/
│       ├── utils/
│       ├── lib/
│       └── App.jsx
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── db/
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   └── server.js
│
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/venkata-arjun/fintelli-ai.git
cd fintelli-ai
```

### 2. Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on its own Vite dev server. The backend runs as a separate Node process. Run `npm run migrate` before starting the backend for the first time to set up the PostgreSQL schema. Make sure all environment variables are configured before starting.

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=8000

DATABASE_URL=your_neon_postgresql_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

GROQ_API_KEY_1=your_groq_api_key_1
GROQ_API_KEY_2=your_groq_api_key_2
GROQ_API_KEY_3=your_groq_api_key_3
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=your_backend_url
```

> Multiple Groq API keys are supported for request load balancing across the Ask AI feature.

---

## Application Flow

**User journey**

```
Landing Page  →  Authentication  →  Dashboard  →  Transactions / Categories / Budgets  →  AI Insights (Gemini)  →  Profile / Ask AI Chatbot (Groq)  →  Financial Recommendations
```

---

## Future Improvements

- Export reports as PDF or Excel
- Recurring transaction support
- OCR bill scanner
- Multi-currency support
- Email reports and alerts
- Bank API integration
- Dark theme
- Mobile app
- Investment tracking

---

## Contributing

Contributions are welcome. Please follow the steps below.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes

```bash
git commit -m "Add: brief description of the change"
```

4. Push your branch

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request on GitHub with a clear description of what was changed and why.

---

## Developer

**Rankela Venkata Arjun** — Full Stack Developer

| | |
|---|---|
| GitHub | https://github.com/venkata-arjun |
| Repository | https://github.com/venkata-arjun/fintelli-ai |
| Live App | https://fintelli-ai.vercel.app |
| Backend API | https://fintelli-ai-backend.onrender.com |

---

<p align="center">Built with the PERN Stack — React, Express, PostgreSQL, Node.js — powered by Google Gemini AI & Groq. Deployed on Vercel & Render.</p>
