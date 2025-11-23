# 🚀 Deployment Guide: Phase 1 & Phase 2

## Overview
This guide walks you through deploying your Math Quiz Website to production using:
- **Phase 1**: Deploy with localStorage (Quick, this week)
- **Phase 2**: Add Firebase for persistent data (Next week)

---

## 📋 Phase 1: Deploy to Render with localStorage

### Phase 1.1: Prepare Files ✅
**Status**: DONE

Files created:
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Render configuration
- ✅ `.env.example` - Environment template
- ✅ `.gitignore` - Protect sensitive files

### Phase 1.2: Create Render Account
**Time**: 5 minutes

1. Go to https://render.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub" (easier)
4. Authorize Render to access your GitHub

### Phase 1.3: Deploy to Render
**Time**: 10-15 minutes

1. On Render dashboard, click "New +"
2. Select "Web Service"
3. Choose "Deploy an existing repo"
4. Select `plasmicshree/math-quiz-website` (your GitHub repo)
5. Fill in settings:
   - **Name**: `math-quiz-website` (or custom name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && python app.py`
   - **Plan**: `Free`

6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Get your live URL: `https://math-quiz-website.onrender.com`

### Phase 1.4: Update Frontend API URL
**Time**: 5 minutes

**Edit**: `frontend/app.js`

Find line with:
```javascript
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```

Replace with:
```javascript
const API_BASE_URL = 'https://math-quiz-website.onrender.com/api';
```

### Phase 1.5: Test Phase 1 Deployment
**Time**: 10 minutes

1. Go to your live URL
2. Test Grade 1 Addition
3. Test Grade 4 Division (with cookies)
4. Refresh page → Check if data persists ✅
5. Try different browser → Data should be gone (expected)
6. Try from different device → Data should be gone (expected)

### Phase 1 Expected Results
```
✅ App is live at https://math-quiz-website.onrender.com
✅ All grades work (1-6)
✅ Grade 4 Division displays cookies
✅ Data persists on same browser/device
✅ No data sync across devices (expected)
```

---

## 🔥 Phase 2: Add Firebase for Persistent Data Storage

### Phase 2.1: Set Up Firebase
**Time**: 15 minutes

1. Go to https://firebase.google.com
2. Click "Get Started"
3. Create new project:
   - Project name: `math-quiz-website`
   - Click "Create Project"
   - Wait for setup

4. Create Firestore Database:
   - Click "Cloud Firestore"
   - Click "Create Database"
   - Select "Start in production mode"
   - Region: `us-central1`
   - Click "Create"

5. Get Firebase Config:
   - Click "Project Settings" (gear icon)
   - Under "General", scroll to "Your apps"
   - Click "</>" (Web)
   - Copy the config object

### Phase 2.2: Design Database Schema
**Collections in Firebase**:

#### Collection 1: `users`
```javascript
{
  userId: "user123",
  email: "student@example.com",
  name: "John Smith",
  createdAt: timestamp,
  lastActive: timestamp,
  totalScore: 1250,
  completedGrades: [1, 2, 3, 4]
}
```

#### Collection 2: `sessions`
```javascript
{
  sessionId: "session456",
  userId: "user123",
  grade: 4,
  section: "division",
  startTime: timestamp,
  endTime: timestamp,
  score: 80,
  questionsAnswered: 10,
  correctAnswers: 8,
  questions: [
    {
      questionId: "q1",
      question: "19 ÷ 3 = ?",
      userAnswer: {quotient: 6, remainder: 1},
      correct: true,
      timeSpent: 45,
      attempts: 1
    }
  ]
}
```

#### Collection 3: `userStats`
```javascript
{
  userId: "user123",
  grade: 4,
  section: "division",
  totalQuestions: 50,
  correctAnswers: 42,
  percentageCorrect: 84,
  averageTimePerQuestion: 45,
  lastAttempt: timestamp
}
```

### Phase 2.3: Create Backend API Endpoints
**Edit**: `backend/app.py`

Add endpoints:
```python
@app.route('/api/user/save', methods=['POST'])
def save_user():
    # Save user to Firebase
    pass

@app.route('/api/session/save', methods=['POST'])
def save_session():
    # Save quiz session to Firebase
    pass

@app.route('/api/user/history', methods=['GET'])
def get_user_history():
    # Get user's quiz history from Firebase
    pass

@app.route('/api/user/stats', methods=['GET'])
def get_user_stats():
    # Get user statistics
    pass
```

### Phase 2.4: Update Frontend for Database
**Edit**: `frontend/app.js`

Replace localStorage calls with API calls:
```javascript
// OLD (localStorage):
localStorage.setItem('userName', name);

// NEW (Firebase via API):
await fetch('${API_BASE_URL}/user/save', {
  method: 'POST',
  body: JSON.stringify({userName: name, userEmail: email})
});
```

### Phase 2.5: Redeploy to Render
**Time**: 5 minutes

1. Commit changes:
```bash
git add .
git commit -m "feat: Add Firebase backend integration for persistent data storage"
git push origin main
```

2. Render automatically redeploys on GitHub push
3. Wait 2-3 minutes for deployment
4. Check live URL for new features

### Phase 2 Expected Results
```
✅ User data saves to Firebase
✅ Data persists across page reloads
✅ Data syncs across devices
✅ User can see their history
✅ Statistics are tracked
```

---

## 🎯 Quick Reference

### Phase 1 Timeline
```
Day 1: Set up Render account (5 min)
Day 2: Deploy app (15 min)
Day 3: Update frontend URLs (5 min)
Day 4: Test deployment (10 min)
Total: ~35 minutes
```

### Phase 2 Timeline
```
Day 1: Set up Firebase (15 min)
Day 2: Create backend endpoints (1-2 hours)
Day 3: Update frontend (1-2 hours)
Day 4: Test and debug (1 hour)
Day 5: Redeploy (5 min)
Total: ~4-5 hours
```

---

## 🔧 Troubleshooting

### Issue: Render deployment fails
**Solution**: 
- Check build logs in Render dashboard
- Verify `requirements.txt` has correct versions
- Make sure `Procfile` path is correct

### Issue: API endpoints return 404
**Solution**:
- Check Render URL in `app.js`
- Verify backend is running on Render
- Check CORS settings in `app.py`

### Issue: Firebase not saving data
**Solution**:
- Verify Firestore rules allow writes
- Check Firebase config is correct
- Check browser console for errors

---

## 📚 Useful Links

- **Render Docs**: https://render.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Flask CORS**: https://flask-cors.readthedocs.io/
- **Firestore Guide**: https://firebase.google.com/docs/firestore

---

## ✅ Checklist

### Phase 1 Checklist
- [ ] Create Render account
- [ ] Deploy app to Render
- [ ] Update frontend API URL
- [ ] Test all grades work
- [ ] Verify localStorage persistence
- [ ] Share live URL

### Phase 2 Checklist
- [ ] Create Firebase project
- [ ] Create Firestore database
- [ ] Design schema
- [ ] Create backend endpoints
- [ ] Update frontend code
- [ ] Test Firebase integration
- [ ] Redeploy to Render
- [ ] Verify data persistence

---

## 🎉 Success!
Once you complete both phases, you'll have:
- ✅ Live production app
- ✅ User authentication
- ✅ Persistent data storage
- ✅ Cross-device sync
- ✅ User statistics
- ✅ Scalable architecture
