# 🛡️ SENTRY - Corporate Intelligence Hub

**A comprehensive intelligence and risk assessment platform for enterprise security operations.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [Module Documentation](#module-documentation)
8. [API Documentation](#api-documentation)
9. [Demo Data](#demo-data)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Sentry** is a modern corporate intelligence platform designed for HR departments and security teams to perform:
- Employee data breach monitoring
- Candidate background verification
- Image intelligence & reverse search
- AI-powered risk assessment and public sentiment analysis

The platform features a sleek, Sentry.io-inspired dark UI with smooth animations and an interactive mouse-following gradient effect.

---

## Features

### 🏢 Human Resources Intelligence
- **Vanguard 1.0** - Identity verification and candidate vetting
  - Reverse Image Search (via SerpAPI)
  - Government Database Cross-reference (Demo data from data.gov.my)
  - Identity verification, criminal records, employment history checks

### 🔒 Intelligence & Risk Assessment
- **Sentinel 1.0** - Data breach monitoring
  - Individual email breach checks
  - Group analysis via CSV upload
  - Real-time exposure scoring
  - Mock breach data for testing

- **Citadel 1.0** - AI-powered risk analysis
  - Public Reaction (OSINT) - Analyzes public sentiment on announcements
  - Future Risk Forecasting - Predicts risks for hypothetical plans
  - Visual analytics with charts and graphs

---

## Tech Stack

### Frontend
- **React** (with Vite)
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **CSS3** - Custom animations and styling

### Backend
- **Node.js** with **Express.js**
- **Cohere AI** - Natural language processing
- **Axios** - HTTP requests
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing

### APIs Used
- **XposedOrNot API** - Data breach checking
- **SerpAPI** - Reverse image search
- **Imgur API** - Image hosting
- **Cohere AI** - Risk analysis and sentiment analysis

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API keys (see Configuration section)

### Step 1: Clone the Repositorybash
cd c:\Users\razin\Downloads\razinxrizwi\indie-crew-main


### Step 2: Install Dependencies

**Frontend:**bash
npm install


**Backend:**bash
cd server
npm install


### Step 3: Environment Setup
Create a .env file in the server/ directory:env
# Data Breach API (optional - uses mock data by default)
HIBP_API_KEY=00000000000000000000000000000000

# SerpAPI (for reverse image search)
SERPAPI_KEY=your_serpapi_key_here

# Imgur (for image hosting)
IMGUR_CLIENT_ID=your_imgur_client_id_here

# Cohere AI (for risk assessment)
COHERE_API_KEY=your_cohere_api_key_here


### Step 4: Start the Application

**Terminal 1 - Backend Server:**bash
cd server
npm start

Backend runs on: http://localhost:3001

**Terminal 2 - Frontend:**bash
npm run dev

Frontend runs on: http://localhost:5173 (or next available port)

---

## Configuration

### API Keys

#### 1. **Cohere AI** (Required for Citadel 1.0)
- Sign up at: https://dashboard.cohere.com/
- Get your API key from the dashboard
- Add to .env: COHERE_API_KEY=your_key

#### 2. **SerpAPI** (Required for Reverse Image Search)
- Sign up at: https://serpapi.com/
- Get your API key
- Add to .env: SERPAPI_KEY=your_key

#### 3. **Imgur** (Required for Image Uploads)
- Create an app at: https://api.imgur.com/
- Get your Client ID
- Add to .env: IMGUR_CLIENT_ID=your_client_id

#### 4. **XposedOrNot** (Optional - uses mock data)
- Free tier available at: https://xposedornot.com/
- Add to .env: HIBP_API_KEY=your_key

---

## Usage Guide

### Homepage Navigation

After the **PETRONAS** intro animation, you'll see two main categories:

#### 1. **Human Resources Intelligence**
Click to access **Vanguard 1.0** with two modes:
- **Reverse Image Search** - Upload an image to verify identity
- **Candidate Vetting** - Cross-check candidate information

#### 2. **Intelligence & Risk Assessment**
Click to access:
- **Sentinel 1.0** - Monitor employee data breaches
- **Citadel 1.0** - Analyze public reactions or forecast risks

---

## Module Documentation

### 🔍 Vanguard 1.0 - Identity Intelligence

#### Reverse Image Search
**Purpose:** Verify if an uploaded image appears elsewhere on the internet

**How to Use:**
1. Click "Reverse Image Search"
2. Upload an image (max 10MB)
3. Click "🔍 Search"
4. View results with matched images and sources

**Technology:** Uses SerpAPI's Google Lens integration

---

#### Candidate Vetting
**Purpose:** Cross-reference candidate information with government databases

**How to Use:**
1. Click "Candidate Vetting"
2. Enter candidate details:
   - Full Name (required)
   - Country/Nationality
   - IC/Passport Number (required)
   - Phone Number
3. Click "🔍 Verify Candidate"
4. View comprehensive background check results

**Demo Candidates:**
| Name | Country | IC/Passport | Phone | Status |
|------|---------|-------------|-------|--------|
| Mohammed Aiman Khalid | Malaysia | 900101-01-1234 | +60 01151166354 | ✅ Cleared |
| Siti binti Rahman | Malaysia | 850615-10-5678 | +60198765432 | ⚠️ Review Required |
| Chen Wei Ming | Singapore | A12345678 | +6598765432 | ✅ Cleared |

**Government Records Checked:**
- ✅ Identity Verification (NRD)
- 🚗 Traffic Violations (JPJ)
- 💼 Employment History (SOCSO)
- 🛂 Immigration Records
- 💰 Tax Compliance
- 🔍 Criminal Record Check

---

### 🛡️ Sentinel 1.0 - Data Breach Monitoring

#### Individual Check
**Purpose:** Check if a single email has been compromised

**How to Use:**
1. Select "Individual Check"
2. Enter email address
3. Click "🔍 Check Breach Status"
4. View breach details and affected services

**Test Email:**
- test@gmail.com - Returns 10-12 mock breaches

---

#### Group Analysis
**Purpose:** Monitor multiple employees for data breaches

**How to Use:**
1. Select "Group Analysis"
2. Upload CSV file with columns: Name, Email, Department
3. Click "📊 Analyze Group"
4. View dashboard with:
   - Total employees
   - Safe count
   - Medium/High risk counts
   - Individual employee cards with exposure scores

**Sample CSV Format:**csv
Name,Email,Department
John Doe,john@example.com,Engineering
Jane Smith,jane@example.com,Marketing


**Sample CSV:** Use indie-crew-main/employee-data.csv

---

### 🎯 Citadel 1.0 - AI Risk Assessment

#### Public Reaction (OSINT)
**Purpose:** Analyze public sentiment about company announcements

**How to Use:**
1. Select "Public Reaction (OSINT)"
2. Paste company announcement or press release
3. Click "🤖 Analyze with AI"
4. View AI-generated intelligence briefing with:
   - Executive Summary
   - Key Themes
   - Threat Analysis
   - Action Items
   - Visual analytics (donut chart, sentiment score)

**Use Case:**
- Monitor public response to product launches
- Track sentiment on corporate decisions
- Identify potential PR crises

---

#### Future Risk (Forecasting)
**Purpose:** Forecast risks for hypothetical future plans

**How to Use:**
1. Select "Future Risk (Forecasting)"
2. Paste internal planning document or strategy proposal
3. Click "🤖 Analyze with AI"
4. View risk assessment with:
   - Executive Summary
   - Potential Risks
   - Severity Assessment
   - Mitigation Strategy
   - Visual analytics

**Use Case:**
- Evaluate new business ventures
- Assess expansion plans
- Identify supply chain vulnerabilities

**Example Input:****Internal Planning Memo: Project SAF-Johor**

**Proposal:** To fast-track the development of a second, world-scale 
biorefinery in Pengerang, Johor, dedicated exclusively to Sustainable 
Aviation Fuel (SAF) production.

**Objective:** To capture 25% of the Southeast Asian SAF market by 2035.


---

## API Documentation

### Backend Endpoints

#### 1. Data Breach CheckPOST http://localhost:3001/api/sentinel/check-breach
Content-Type: application/json

{
  "email": "test@example.com"
}

Response:
{
  "breached": true,
  "breachCount": 12,
  "exposureScore": 85,
  "breaches": [...]
}


---

#### 2. Group Breach AnalysisPOST http://localhost:3001/api/sentinel/analyze-group
Content-Type: multipart/form-data

file: employee-data.csv

Response:
{
  "employees": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "breached": true,
      "breachCount": 5,
      "riskLevel": "Medium"
    }
  ]
}


---

#### 3. Reverse Image SearchPOST http://localhost:3001/api/vanguard/reverse-search
Content-Type: multipart/form-data

image: uploaded_file.jpg

Response:
{
  "results": [
    {
      "thumbnail": "...",
      "source": "...",
      "link": "..."
    }
  ]
}


---

#### 4. Candidate VettingPOST http://localhost:3001/api/vanguard/vet-candidate
Content-Type: application/json

{
  "fullName": "Mohammed Aiman Khalid",
  "country": "Malaysia",
  "icPassport": "900101-01-1234",
  "phone": "+60 01151166354"
}

Response:
{
  "status": "Cleared",
  "candidate": {
    "name": "Mohammed Aiman Khalid",
    "dob": "1990-01-01",
    ...
  },
  "records": {...}
}


---

#### 5. AI Risk AssessmentPOST http://localhost:3001/api/strategic-intel/analyze
Content-Type: application/json

{
  "rawText": "Company announcement text...",
  "analysisMode": "public_reaction"
}

Response:
{
  "success": true,
  "ai_summary": "## Executive Summary\n...",
  "analysis_mode": "public_reaction",
  "timestamp": "2025-11-16T..."
}


---

## Demo Data

### Test Accounts for Sentinel 1.0
| Email | Expected Result |
|-------|----------------|
| test@gmail.com | 10-12 breaches (mock data) |
| Any other email | Real XposedOrNot API data |

### Test Candidates for Vanguard 1.0
| Name | IC/Passport | Result |
|------|-------------|--------|
| Mohammed Aiman Khalid | 900101-01-1234 | ✅ Cleared |
| Siti binti Rahman | 850615-10-5678 | ⚠️ Review Required |
| Chen Wei Ming | A12345678 | ✅ Cleared |

### Sample Files
- **Employee CSV:** indie-crew-main/employee-data.csv
- Contains 3 employees with mock breach data

---

## Troubleshooting

### Issue: Port Already in Usebash
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in server/index.js
const PORT = 3002;


---

### Issue: Cohere AI
