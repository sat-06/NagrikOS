# 🏛️ NagrikOS – AI Civic Action Agent

> **An AI-powered digital governance platform that simplifies how citizens discover government schemes, manage civic issues, and access public services through a unified intelligent assistant.**

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple)

---

# 🌐 Live Deployment

### 🚀 Frontend
**https://nagrik-os.vercel.app/**

### ⚡ Backend
**https://nagrikos-2.onrender.com**

---

# 📖 Overview

Navigating government services often requires citizens to search across multiple portals, understand complex eligibility criteria, collect numerous documents, and repeatedly visit different offices.

**NagrikOS** addresses these challenges by providing a single AI-powered platform where citizens can interact using natural language while receiving personalized recommendations, civic guidance, complaint management, and document assistance.

The platform combines Artificial Intelligence with modern web technologies to make government services more accessible, transparent, and citizen-friendly.

---

# 🎯 Core Objectives

- Simplify access to government schemes.
- Reduce confusion regarding eligibility and documentation.
- Enable AI-driven civic assistance.
- Digitize complaint registration and tracking.
- Personalize recommendations using citizen profiles.
- Provide an intuitive and multilingual user experience.

---

# ✨ Features

## 🤖 AI Saathi

AI Saathi is the intelligent assistant at the core of NagrikOS.

Users can describe their situations naturally instead of searching through multiple government websites.

AI Saathi provides:

- Context-aware civic guidance
- Personalized government scheme recommendations
- Life situation analysis
- Suggested next actions
- Relevant official sources
- Multilingual conversational assistance

---

## 👤 Citizen Profile

A centralized citizen profile enables personalized recommendations across the platform.

The profile stores information such as:

- Full Name
- State & District
- Occupation
- Income Category
- Preferred Language
- Student Status
- Farmer Status
- Senior Citizen Status
- Additional citizen attributes

The recommendation engine uses this information to provide highly relevant government schemes.

---

## 🎯 Opportunity Radar

Opportunity Radar intelligently recommends government schemes based on the user's profile.

Each recommendation includes:

- Eligibility details
- Benefits
- Required documents
- Application process
- Official references
- Personalized matching criteria

This eliminates the need for manually searching across multiple government portals.

---

## 📄 DocReady AI

DocReady AI evaluates whether a citizen possesses the required documents before applying for a scheme.

Features include:

- Document readiness score
- Missing document detection
- Available document tracking
- Application readiness analysis
- Next recommended actions

---

## 🚨 Drishti Reports

Drishti Reports enables citizens to report civic issues using AI-assisted complaint management.

Capabilities include:

- AI-powered complaint categorization
- Department recommendation
- Duplicate complaint detection
- Complaint timeline tracking
- Resolution verification
- Support for joining existing public issues

---

## 🎯 Civic Missions

Government applications often involve multiple sequential steps.

Civic Missions converts complex government processes into structured task flows.

Each mission includes:

- Step-by-step guidance
- Progress tracking
- Required documents
- Mission completion status
- Recommended next action

---

## 📊 Personalized Dashboard

The dashboard provides a consolidated overview of citizen activity.

It displays:

- Active missions
- Personalized scheme recommendations
- Complaint progress
- Document readiness
- Profile completion
- Civic insights

---

## 🔐 Secure Authentication

The platform implements JWT-based authentication for secure access.

Features include:

- User Registration
- Secure Login
- Persistent Sessions
- Protected Routes
- Profile-based authorization

---

# 🏗️ System Architecture

NagrikOS follows a modern client-server architecture.

### Frontend

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- Shadcn UI
- Axios

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite / PostgreSQL
- Uvicorn

### AI Layer

- OpenAI API Integration
- Prompt Engineering
- Civic Recommendation Engine
- Complaint Classification
- Natural Language Understanding

---

# 📂 Project Structure

```
NagrikOS
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── ai
│   │   ├── core
│   │   ├── db
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   └── utils
│   │
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── routes
│   │   ├── lib
│   │   ├── assets
│   │   ├── hooks
│   │   ├── types
│   │   └── i18n
│
└── README.md
```

---

# 🔒 Security

The platform incorporates several security measures including:

- JWT Authentication
- Password Hashing
- Protected API Endpoints
- Secure Token Storage
- Request Validation using Pydantic
- CORS Protection
- Environment Variable Configuration

---

# 💻 Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Authentication | JWT |
| Database | SQLite / PostgreSQL |
| AI | OpenAI API |
| Deployment | Vercel, Render |
| Version Control | Git & GitHub |

---



# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.