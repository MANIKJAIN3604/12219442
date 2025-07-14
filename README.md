# URL Shortener & Analytics Web App

A modern, client-side URL shortener built with React, TypeScript, and Material UI. This application allows users to generate unique short links, manage their validity, and view detailed analytics—all without a backend database. All major events are logged using a custom logging middleware for robust observability.

## ✨ Features

- **Shorten up to 5 URLs at once** with optional custom shortcodes and validity periods (default: 30 minutes)
- **Client-side validation** for URLs, shortcodes, and validity
- **Unique short link generation** (auto or user-defined, with collision checks)
- **Material UI** for a clean, responsive, and accessible interface
- **Redirection** handled via React Router, with expiry checks
- **Analytics Dashboard**:
  - Track total clicks per short URL
  - View click details: timestamp, source, and (placeholder) location
- **Copy-to-clipboard** for easy sharing of short links
- **Persistent storage** using browser localStorage/sessionStorage
- **Comprehensive logging** via a reusable middleware (no console.log!)
- **User-friendly error handling** and feedback

## 🏗️ Project Structure

```
12219442/
├── frontend/              # React app (Material UI, all logic/UI)
├── logging-middleware/    # Reusable logging module (API-based)
└── README.md              # This file
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm start
   ```
3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 🛠️ Logging Middleware
- All logs (page loads, errors, URL creation, redirects, analytics views, etc.) are sent to a remote API using a custom middleware.
- No use of `console.log` or browser logging—everything is tracked via the logger for full traceability.

## 📊 Analytics & Insights
- Every short URL tracks click events, including when, where, and how the link was accessed.
- The statistics page provides a clear overview of all your links and their performance.

## 🖥️ Screenshots
- Please see the `/screenshots` folder for both desktop and mobile views (add your own screenshots here).

## 📦 Tech Stack
- **React** (with TypeScript)
- **Material UI** for UI components
- **Vite** for fast development
- **Custom Logging Middleware** (TypeScript, reusable)

## 📚 License
This project is for educational and evaluation purposes.

---

*Developed for the Campus Hiring Evaluation. For any queries, contact the repository owner.*
