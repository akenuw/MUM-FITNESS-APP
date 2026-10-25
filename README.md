# FitTrack - Fitness Tracking App

FitTrack is a comprehensive fitness tracking application built with React Native (Expo) for the frontend and Node.js/Express for the backend.

## Project Structure

The project is organized as follows:

```
frontend/               # Main project directory
├── app/                # Frontend app screens using Expo Router
├── assets/             # Images, fonts, and other static assets
├── components/         # Reusable React components
├── services/           # API services and utilities
├── backend/            # Backend server and API
│   ├── src/            # Backend source code
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Express middleware
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── utils/      # Utility functions
│   │   └── server.js   # Main server file
│   ├── .env            # Environment variables
│   └── package.json    # Backend dependencies
└── package.json        # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email verification)

### Installation

1. Install all dependencies (frontend and backend):

   ```bash
   npm run install:all
   ```

2. Configure email settings:
   - Follow the instructions in `backend/EMAIL_SETUP.md`
   - Update the `.env` file in the backend directory with your email credentials

### Running the Application

1. Start the backend server with automatic IP configuration:

   ```bash
   node start-backend.js
   ```

   This script will:
   - Find your computer's IP address
   - Update the API URL in services/api.js
   - Start the backend server

2. Start the frontend (Expo):

   ```bash
   npx expo start --tunnel
   ```

3. Scan the QR code with the Expo Go app on your device

4. Real-time Email Verification:
   - When you log in, a verification code will be sent to your email
   - Check your inbox for the verification code
   - Enter the code in the app to complete the login process

## Features

- User authentication with email verification
- User profile management
- Fitness goal tracking
- Workout statistics

## Backend API

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (sends verification code)
- `POST /api/auth/verify` - Verify email with code
- `GET /api/auth/me` - Get current user (protected)

### Profile
- `POST /api/profile` - Create or update user profile (protected)
- `GET /api/profile` - Get current user's profile (protected)
- `PUT /api/profile/stats` - Update user stats (protected)
- `PUT /api/profile/goals` - Update user goals (protected)

## Email Verification

The app uses real email verification for user authentication. See `backend/EMAIL_SETUP.md` for setup instructions.

## Troubleshooting

If you encounter issues:

1. **Use the start-backend.js script**
   - Always use `node start-backend.js` to start the backend server
   - This will automatically configure the API URL with your IP address

2. **Make sure your device and computer are on the same network**
   - Your mobile device and computer must be on the same WiFi network
   - Some public networks block the necessary ports

3. **Use the tunnel option**
   - If you're still having issues, try: `npx expo start --tunnel`
   - This creates a secure tunnel that works across networks

4. **Check your email configuration**
   - Make sure your email credentials in the `.env` file are correct
   - Check that your email provider allows sending emails from apps

5. **Clear Expo cache**
   - If you're having persistent issues, try:
   ```bash
   npx expo start --clear
   ```

6. **Restart the backend server**
   - Sometimes simply restarting the backend server can fix connection issues
   - Use `node start-backend.js` to restart the server
