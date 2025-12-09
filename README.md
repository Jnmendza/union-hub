Union Hub

A comprehensive mobile-first application for union members and a desktop-first dashboard for administrators. Built with Next.js 14 and Firebase.

🚀 Features

📱 Mobile App (Member View)

Real-time Chat: Secure, instant group messaging with optimistic UI updates.

The Vault: Read-only access to official resources, bylaws, and chants.

Digital ID: Profile with QR Code generation for member verification.

Announcements: Urgent updates and event notifications on the home feed.

Groups: Join and participate in multiple sub-groups.

💻 Admin Dashboard (Desktop View)

User Management: Edit roles (Member/Board/Admin), verify Union IDs, and ban users.

Announcement System: Broadcast urgent alerts, events, or general info to all members.

Document Control: Upload, categorize, and manage files in The Vault.

Analytics: High-level overview of total members, active groups, and resource counts.

🛠️ Tech Stack

Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS

Icons: Lucide React

Backend & DB: Firebase (Firestore, Auth, Storage)

Deployment: Vercel

🏁 Getting Started

1. Prerequisites

Node.js 18+ installed.

A Firebase project created at console.firebase.google.com.

2. Installation

# Clone the repository

git clone [https://github.com/yourusername/union-hub.git](https://github.com/yourusername/union-hub.git)

# Enter the directory

cd union-hub

# Install dependencies

npm install

3. Environment Setup

Create a .env.local file in the root directory and add your Firebase credentials:

NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

4. Firebase Configuration (Critical)

For the app to work, you must enable three services in your Firebase Console:

A. Authentication

Go to Authentication > Sign-in method.

Enable Email/Password.

B. Firestore Database

Create a Firestore Database (start in Test mode).

Go to the Rules tab and paste the following:

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {

    // 1. USER PROFILES
    match /users/{userId} {
      allow read: if request.auth != null;
      // Allow write if owner OR admin
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN'
      );
    }

    // 2. GROUPS
    match /groups/{groupId} {
      allow read, create, update: if request.auth != null;
    }

    // 3. MESSAGES
    match /groups/{groupId}/messages/{messageId} {
      function isMember() {
        return request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;
      }
      allow read, create: if request.auth != null && isMember();
    }

    // 4. ANNOUNCEMENTS
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Ideally restrict to ADMIN
    }

    // 5. RESOURCES (VAULT)
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Ideally restrict to ADMIN
    }

}
}

C. Storage (For File Uploads)

Enable Firebase Storage.

Fix CORS Error: By default, Firebase blocks uploads from localhost. Run this in Google Cloud Shell to fix it:

echo '[{"origin": ["*"],"method": ["GET", "HEAD", "PUT", "POST", "DELETE"],"maxAgeSeconds": 3600}]' > cors.json
gsutil cors set cors.json gs://YOUR_BUCKET_NAME.appspot.com

5. Run the App

npm run dev

Open http://localhost:3000 to see the app.

📂 Project Structure

app/
├── (auth)/ # Login, Register, Forgot Password pages
├── (dashboard)/ # ADMIN Panel Layout & Pages
│ └── admin/ # /admin/users, /admin/documents, etc.
├── (mobile-app)/ # MAIN App Layout (Mobile Nav)
│ ├── groups/ # Chat functionality
│ ├── profile/ # User ID & QR Code
│ ├── vault/ # Resource Library
│ └── page.tsx # Home Feed
└── layout.tsx # Root layout

🛡️ Roles & Permissions

MEMBER: Default role. Can view vault, chat in groups they belong to.

ADMIN: Can access /admin. Can edit user roles, delete users, post announcements, and manage vault files.

To make yourself an admin locally:

Sign up in the app.

Go to Firestore Console > users collection.

Find your document and add a field: role: "ADMIN".
