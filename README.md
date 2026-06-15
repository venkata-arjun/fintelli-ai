
# Fintelli AI

An AI-powered personal finance tracker built using the MERN stack and Google Gemini AI. The application helps users manage transactions, monitor budgets, visualize financial trends, and receive personalized AI-powered spending insights and savings recommendations.

**Live Demo:** https://fintelli-ai.vercel.app/

**GitHub:** https://github.com/venkata-arjun/fintelli-ai

---

# Overview

Fintelli AI is a modern personal finance management platform designed to simplify budgeting and expense tracking while leveraging Artificial Intelligence to provide meaningful financial insights.

Users can organize transactions, monitor budgets, analyze spending habits, and receive AI-generated summaries and recommendations to improve their financial planning.

---

# Features

## Transaction Management

- Add income and expense transactions
- Edit and delete existing transactions
- View complete transaction history
- Search and filter transactions

## Financial Dashboard

- Real-time financial overview
- Total income and expense tracking
- Current balance calculation
- Interactive analytics and charts

## Budget Management

- Create monthly budgets
- Monitor spending limits
- Track budget utilization
- Budget health analysis

## Category Management

- Organize transactions into custom categories
- Category-wise expense analysis
- Income and expense classification

## AI Financial Insights

Powered by Google Gemini AI:

- Monthly spending summaries
- Personalized savings recommendations
- Budget performance analysis
- Spending pattern detection
- Actionable financial suggestions

---

# Tech Stack

| Category | Technology |
|-----------------|--------------------------------|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI Integration | Google Gemini API |
| Authentication | JWT, bcrypt |
| State Management | React Context API |
| Charts | Recharts |
| Deployment | Vercel (Frontend), Render (Backend) |

---

# Project Structure

```text
fintelli-ai/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# Core Modules

| Module | Description |
|--------------------------------|------------------------------------------------|
| Authentication | Secure JWT-based user authentication |
| Transaction Management | Manage income and expense records |
| Budget Tracker | Create and monitor monthly budgets |
| Category Management | Organize financial transactions |
| Financial Analytics | Visualize spending trends and reports |
| AI Insights | AI-generated financial recommendations |

---

# AI Capabilities

Google Gemini AI analyzes transaction history and financial data to provide:

- Monthly spending summaries
- Personalized savings recommendations
- Budget health evaluation
- Expense trend analysis
- Category-wise insights
- Smart financial suggestions

---

# Dashboard Analytics

The application provides:

- Total Income
- Total Expenses
- Current Balance
- Budget Utilization
- Category-wise Spending
- Monthly Financial Trends
- AI Financial Insights

---

# Installation

## Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas
- Google Gemini API Key

---

## Clone the Repository

```bash
git clone https://github.com/venkata-arjun/fintelli-ai.git

cd fintelli-ai
```

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

# Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_api_key
```

---

# Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm start
```

The application will be available at:

```
Frontend : http://localhost:3000

Backend  : http://localhost:5000
```

---

# Highlights

- MERN Stack Architecture
- Google Gemini AI Integration
- Secure JWT Authentication
- Real-time Financial Dashboard
- Interactive Charts and Analytics
- Responsive User Interface
- Modular and Scalable Codebase

---

# Future Enhancements

- PDF and CSV Export
- Email Budget Notifications
- Multi-Currency Support
- Recurring Transaction Management
- Investment Portfolio Tracking
- Expense Prediction using Machine Learning
- React Native Mobile Application

---

# Contributing

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request
