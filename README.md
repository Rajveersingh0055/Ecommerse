# Orufy Assignment - Full Stack Product Management App

A complete full-stack web application featuring an OTP-based authentication system, JWT session management, and a robust product dashboard. Built with React (Vite) for the frontend and Node.js/Express with MongoDB for the backend.

## 🚀 Features

- **OTP-based Authentication:** Secure 2-step login/registration flow via email/phone using Nodemailer.
- **Product Management:** Full CRUD operations for products (Create, Read, Update, Delete).
- **Image Uploads:** Multipart form-data handling using Multer for product images.
- **Publish toggling:** Quick toggle switch to move products between published and unpublished states.
- **Modern UI:** Clean, responsive UI mirroring the provided Figma designs, including exact styling for Auth and Dashboard pages.
- **Secure Sessions:** JWT-based protected routes with Axios interceptors automatically handling headers.

## 🛠️ Technology Stack

**Frontend:**
- React 18, Vite, React Router DOM
- Custom CSS based on Figma designs
- Axios for API communication

**Backend:**
- Node.js, Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Multer (File uploads), Nodemailer (OTP emails)
- CORS, dotenv

## 📁 Project Structure

\\\	ext
├── client/          # React Frontend (Vite)
│   ├── public/      # Static assets (images)
│   ├── src/         # React components, pages, styles, api config
│   └── package.json # Frontend scripts & dependencies
├── server/          # Node/Express Backend
│   ├── src/         # Controllers, Models, Routes, DB config
│   ├── uploads/     # Stored image uploads via Multer
│   └── package.json # Backend scripts & dependencies
└── docs/            # Architecture & Setup documentation
\\\

## ⚙️ Setup & Installation

### 1. Backend Setup
\\\ash
cd server
npm install
\\\
Create a \.env\ file in the \server/\ root:
\\\env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
\\\
Run the server:
\\\ash
npm run dev
\\\

### 2. Frontend Setup
\\\ash
cd client
npm install
\\\
Run the Vite development server:
\\\ash
npm run dev
\\\

## 📡 API Reference (Summary)

- \POST /api/auth/register\ - Register user & generate OTP
- \POST /api/auth/send-otp\ - Generate OTP for login
- \POST /api/auth/verify-otp\ - Verify OTP & return JWT
- \GET /api/products\ - Fetch all products (Supports \?status=\ filter)
- \POST /api/products\ - Create product (supports multipart/form-data files)
- \PUT /api/products/:id\ - Update product
- \PATCH /api/products/:id/toggle\ - Toggle isPublished status
- \DELETE /api/products/:id\ - Remove product

