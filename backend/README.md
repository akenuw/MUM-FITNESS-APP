# FitTrack Backend API

This is the backend API for the FitTrack fitness application.

## Features

- User authentication with email verification
- User profile management
- Fitness goals tracking
- Workout statistics

## Tech Stack

- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fittrack
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@fittrack.com
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

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

## Authentication Flow

1. User enters email on login screen
2. Backend sends a verification code to the email
3. User enters the verification code
4. Backend verifies the code and returns a JWT token
5. Frontend stores the token and uses it for authenticated requests

## Data Models

### User

- email (String, required, unique)
- password (String, hashed)
- verificationCode (String, hashed)
- isVerified (Boolean)
- createdAt (Date)

### Profile

- user (ObjectId, ref: 'User')
- name (String)
- age (Number)
- height (Number)
- weight (Number)
- fitnessGoals (Array of Strings)
- customGoal (String)
- fitnessLevel (String)
- workoutFrequency (String)
- stats (Object)
- achievements (Array of Objects)
- goals (Object)
- createdAt (Date)
- updatedAt (Date)

## License

MIT
