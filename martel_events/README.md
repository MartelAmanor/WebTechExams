# Aura Events - Campus Event Management System

A modern web application for managing campus events, built with React, Express, and MongoDB.

## Features

- User Registration & Authentication
- Event Creation & Management
- Event Calendar View
- RSVP System
- Responsive Design
- Admin Dashboard

## Tech Stack

### Frontend
- React (with Vite)
- Tailwind CSS
- React Router DOM
- React Big Calendar
- Headless UI
- Heroicons

### Backend
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
martel_events/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
└── backend/           # Express backend
    ├── models/
    ├── routes/
    ├── middleware/
    └── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
