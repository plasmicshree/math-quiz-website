# Server Startup Guide

## CRITICAL: Backend and Frontend MUST Run in SEPARATE Terminals

**⚠️ IMPORTANT**: Do NOT run backend and frontend in the same terminal. They will block each other.

---

## Quick Start

### Terminal 1: Backend Server
```powershell
cd e:\math_webpage\math_quiz_website
.venv\Scripts\Activate.ps1
cd backend
python app.py
```
**Expected Output**: `Running on http://127.0.0.1:5000`  
**Port**: 5000  
**Keep this terminal open**

### Terminal 2: Frontend Server
```powershell
cd e:\math_webpage\math_quiz_website
cd frontend
python -m http.server 8000
```
**Expected Output**: `Serving HTTP on 0.0.0.0 port 8000` or `Serving HTTP on :: port 8000`  
**Port**: 8000  
**Keep this terminal open**

### Terminal 3 (Optional): Testing/Git Commands
Use this for git, testing, and other commands

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         Web Browser (User)                   │
│         http://localhost:8000                │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐           ┌───▼─────┐
   │ Frontend │           │ Backend │
   │ Port 8000│           │ Port 5000
   └──────────┘           └─────────┘
  (HTTP Server)         (Flask API)
   Terminal 2            Terminal 1
```

---

## Important Notes

1. **Separate Terminals Required**: Each server runs in blocking mode
   - Terminal 1: Backend (port 5000)
   - Terminal 2: Frontend (port 8000)
   - Terminal 3+: For other commands

2. **Frontend loads from port 8000**: Open http://localhost:8000 in browser

3. **Frontend calls backend on port 5000**: API calls to http://localhost:5000/api/*

4. **Cache Busting**: Use `?t=TIMESTAMP` parameter when testing frontend changes

5. **If servers don't start**:
   - Check if ports 5000 or 8000 are in use
   - Use: `netstat -ano | findstr :5000` or `:8000`
   - Kill process if needed

---

## Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process
taskkill /PID <PID> /F

# Then try again
cd e:\math_webpage\math_quiz_website\backend
python app.py
```

### Frontend won't start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If in use, kill the process or use different port
cd e:\math_webpage\math_quiz_website\frontend
python -m http.server 8000

# Or use different port if 8000 is taken
python -m http.server 8001
```

### Connection Refused
- Make sure BOTH servers are running in separate terminals
- Check terminal 1 for backend error messages
- Check browser console (F12) for network errors

---

## Development Workflow

1. **Start Backend** (Terminal 1): `cd backend && python app.py`
2. **Start Frontend** (Terminal 2): `cd frontend && python -m http.server 8000`
3. **Make Changes**: Edit files in your editor
4. **Test in Browser**: http://localhost:8000 (with cache bust: `?t=TIMESTAMP`)
5. **Check Backend Logs**: Look at Terminal 1 for API errors
6. **Check Frontend Logs**: Open DevTools (F12) in browser

---

## Making Changes

### After changing backend files (app.py, grade_*.py)
- Backend auto-reloads when files change
- Refresh browser to see new data

### After changing frontend files (app.js, style.css, index.html)
- Refresh browser (Ctrl+Shift+R for cache bust)
- Or add `?t=TIMESTAMP` to bypass cache

---

## Commits and Pushes

Always use Terminal 3 or a new terminal for git operations:
```powershell
git status
git add .
git commit -m "Your message"
git push origin feature/grade-1-subtraction
```

**Do NOT use the same terminal as the servers** - it will be blocked.

---

## Last Updated
November 22, 2025 - Initial creation

**Remember**: Backend Terminal 1, Frontend Terminal 2, Commands Terminal 3+
