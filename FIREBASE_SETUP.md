# Firebase Setup Guide — Step by Step

## Step 1: Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project" → Name: `primepay` → Continue
3. Disable Google Analytics → Create project

## Step 2: Enable Authentication
1. Left menu → Build → **Authentication** → Get started
2. Sign-in method → **Email/Password** → Enable → Save

## Step 3: Enable Firestore
1. Left menu → Build → **Firestore Database** → Create database
2. Select **Start in test mode** → Next → Select region → Enable

## Step 4: Get Web App Config (for Frontend)
1. Project Settings (gear icon top-left)
2. Scroll to "Your apps" → Click `</>` Web icon
3. App nickname: `primepay-web` → Register app
4. Copy the config object — paste into `frontend/.env`

## Step 5: Get Service Account Key (for Backend)
1. Project Settings → **Service accounts** tab
2. Click "Generate new private key" → Download JSON
3. Rename to `serviceAccountKey.json`
4. Place in `backend/config/serviceAccountKey.json`

## Step 6: Firestore Security Rules
Go to Firestore → Rules tab → Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Click Publish.

## Step 7: Create SuperAdmin
After backend is running:
```bash
cd scripts
node createSuperAdmin.js
```
This creates superadmin@primepay.com with role=superadmin in Firestore.

## Step 8: GitHub Pages Deploy (Frontend only)
1. Run `cd frontend && npm run build`
2. Install gh-pages: `npm install -g gh-pages`
3. `gh-pages -d build`
4. Or push to GitHub → Vercel/Netlify for auto-deploy
