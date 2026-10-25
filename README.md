# My Mum Fitness App (FitTrack)

A modern, supportive wellness and fitness tracking application for mums, built with **React Native (Expo)**, **TypeScript**, and a serverless **Supabase** backend.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React Native, Expo 57, Expo Router, TypeScript, React Native Reanimated
- **Backend & Auth**: [Supabase](https://supabase.com)
  - **Auth**: Built-in Email OTP verification (no local SMTP or passwords needed)
  - **Database**: PostgreSQL with Row Level Security (RLS) policies
  - **Session Persistence**: Secure token storage via `expo-secure-store` (native) and `localStorage` (web)
- **State & Storage**: Cross-platform persistent caching layer (`utils/storage.ts`)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to your **SQL Editor** in the Supabase Dashboard, create a **New Query**, paste the contents of [`supabase/setup.sql`](./supabase/setup.sql), and click **Run**.
   - This creates the `profiles` table, Row Level Security policies, and automated user creation triggers.
3. Copy your project URL and anon public key from **Project Settings > API**.
4. Create a `.env` file in the root directory (based on `.env.example`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the App

Start the Expo development server:

```bash
npm start
```

- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Press `w` to run in Web browser
- Or scan the QR code with **Expo Go** on your physical phone!

---

## 🔒 Authentication Flow

1. **Email OTP**: User enters their email address on the Login screen.
2. **Dispatch**: Supabase dispatches a 6-digit OTP code directly to their email inbox.
3. **Verification**: User inputs the 6-digit code on the Verification screen. Supabase verifies the code and issues an authenticated session token.
4. **Profile Setup**: New users complete their initial wellness goals; existing users are routed straight to the dashboard (`/(tabs)`).

---

## 📁 Project Structure

```
├── app/                  # Expo Router file-based screens and tabs
│   ├── (tabs)/           # Dashboard, Workouts, Progress, Profile, Nutrition
│   ├── login.tsx         # Login screen
│   ├── verification.tsx  # 6-digit Email OTP screen
│   ├── profile-setup.tsx # Multi-step onboarding profile setup
│   └── _layout.tsx       # Root layout & navigation providers
├── components/           # Reusable UI components
├── constants/            # Design system colors and styles
├── services/             # Supabase client & API services
│   ├── supabase.ts       # Configured Supabase client with SecureStore adapter
│   └── api.ts            # authService & profileService with offline caching
├── supabase/             # Database migrations and setup scripts
│   ├── setup.sql         # Consolidated SQL setup script for SQL Editor
│   └── migrations/       # Versioned migration files
├── utils/                # Storage, network connection, and polyfill utilities
└── package.json          # Dependencies & scripts
```
