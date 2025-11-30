# 🤖 AI Assistant Context File
# Purpose: Help me (GitHub Copilot) remember critical project information
# Last Updated: November 23, 2025

## CRITICAL REQUIREMENTS (ALWAYS REMEMBER!)

### 1. SERVER ARCHITECTURE - NEVER FORGET THIS!
**REQUIREMENT: TWO SEPARATE TERMINALS REQUIRED**
- Terminal 1: Backend (Flask, port 5000)
- Terminal 2: Frontend (Python HTTP, port 8000)  
- Terminal 3+: Git and other commands
- ❌ NEVER run backend and frontend in same terminal
- ✅ Both must be running simultaneously for app to work

### 2. Quick Startup Commands
```powershell
# Terminal 1 - Backend (ONE LINE)
cd e:\math_webpage\math_quiz_website; .venv\Scripts\Activate.ps1; cd backend; python app.py

# Terminal 2 - Frontend (ONE LINE, in NEW terminal window)
cd e:\math_webpage\math_quiz_website; .venv\Scripts\Activate.ps1; cd frontend; python -m http.server 8000

# Browser: http://localhost:8000
```

### 3. Key File Locations
- Backend API: `backend/app.py` (348 lines)
- Frontend UI: `frontend/app.js` (1722 lines)
- Main HTML: `frontend/index.html`
- Styling: `frontend/style.css`
- Grade Logic: `backend/grades/grade_1.py` through `grade_6.py`
- Block Utils: `backend/grades/block_utils.py` (reusable)

### 4. Recent Implementation (Nov 23, 2025)
**COMPLETED:**
- ✅ Grade 4 Division with visual cookie grouping strategy
  - Divisor logic: 2-5 if dividend ≤25; 6-9 if dividend >25 (80% probability)
  - 50% probability of remainder
  - SVG visualization: Gold circles for groups, pink for remainder
  - Student enters quotient and remainder
  - Verification formula: (quotient × divisor) + remainder = dividend
- ✅ Grade 2: Addition with 10-section visual blocks
- ✅ Grade 2: Subtraction with "Take Away" concept
- ✅ Grades 3-6: Updated ranges

**IN PROGRESS:**
- (None currently)

**NEXT:**
- Grade 5/6 additional improvements
- More word problem templates

### 5. Grade 4 Division Implementation Details
**Backend (`backend/grades/grade_4.py`):**
- `generate_division_question()`: Returns question with visual data
- Returns dict: `{question, dividend, divisor, quotient, remainder, visual}`
- Divisor selection: `if dividend > 25: divisor = randint(6,9) else: divisor = randint(2,5)`
- Remainder probability: 50% chance

**Frontend (`frontend/app.js`):**
- Line 973: `renderGrade4Division(data, chartContainer)` - Main rendering
- Line 1057: `renderCookieGroups(dividend, divisor, quotient, remainder)` - SVG generation
- SVG Cookie Display: Groups labeled "Group 1", "Group 2", etc. with emoji 🍪
- Solution Hidden: ID `division-solution-hidden` - reveals on correct answer or max attempts
- Input Fields: Quotient and remainder show "?" until answered

**Explanation Text (Line 995):**
- Format: "We're sharing {dividend} cookies equally among {divisor} friends. How many does each friend get?"
- Example: "We're sharing 19 cookies equally among 2 friends. How many does each friend get?"

### 6. Frontend Architecture (IMPORTANT!)
**SVG Block Rendering:**
- Grade 1 Addition: 5 sections per block
- Grade 2 Addition: 10 sections per block
- Grade 2 Subtraction: 10 sections per block
- Grade 4 Division: Dynamic SVG cookies in groups
- All use dynamic rendering functions

**Solution Reveal:**
- Functions: `revealAdditionSolution()`, `revealSubtractionSolution()`
- Triggered on correct answer or after 3 attempts
- Hidden divs: `addition-solution-hidden`, `subtraction-solution-hidden`, `division-solution-hidden`

### 7. Session Management (Nov 23, 2025)
**Default Behavior (NORMAL):**
- User info is saved and persists across page reloads
- Grade selection is saved
- Session history is preserved
- Perfect for normal use and testing

**Hard Reset (DEVELOPMENT ONLY):**
- Visit `http://localhost:8000/clear-session.html`
- Two options available:
  1. **Clear User Info Only**: Removes username/email, keeps sessions
  2. **Hard Reset Everything**: Removes ALL data (user, sessions, grades)
- Manual uncomment in `app.js` line 4: `localStorage.clear(); sessionStorage.clear();`
  - Uncomment, reload page, then comment back out
  - This clears everything on that one reload

**Key Points:**
- ✅ User info now persists by default
- ✅ Sessions are saved and restored on page reload
- ✅ Hard reset is optional and manual (good for development testing)
- ✅ No automatic clearing - user experience is preserved

### 8. Cache Busting (IMPORTANT!)
- Script tag in `frontend/index.html` line 90: `<script src="app.js?v=..."></script>`
- After any app.js changes: Update version number
- Browser cache: Use Ctrl+Shift+R or `?t=TIMESTAMP` parameter

### 9. Backend Architecture
**Question Generation:**
- Each grade has `generate_<operation>_question()` function
- Returns dict with `question`, `answer`, and operation-specific data
- Grade 1-2 addition/subtraction include `visual` dict with block data
- Grade 4 division includes `visual` dict with cookie grouping data

**API Response Format (Line 285 of app.py):**
```python
# For addition (Grade 1-2 only):
resp["visual"] = q.get("visual")
resp["first_number"] = q.get("first_number")
resp["second_number"] = q.get("second_number")

# For subtraction (Grade 2 only):
resp["visual"] = q.get("visual")
resp["minuend"] = q.get("minuend")
resp["subtrahend"] = q.get("subtrahend")
```

### 8. Documentation Structure
```
docs/
├── README.md (MAIN HUB - all docs linked from here)
├── architecture/ (System design, API docs)
├── features/ (SUBTRACTION_IMPLEMENTATION.md)
├── grading/ (GRADE_2_IMPLEMENTATION.md, GRADE_NUMBER_LIMITS.md)
├── operations/ (GETTING_STARTED.md, SERVER_STARTUP_GUIDE.md)
└── development/ (DEVELOPMENT_LOG.md, REDUNDANCY_ANALYSIS.md)
```

### 9. Current Branch & Status
- **Branch:** feature/grade-1-subtraction
- **Remote:** origin/feature/grade-1-subtraction  
- **Status:** All changes committed and pushed
- **Last Commit:** 39bd9a6 - "feat: Complete Grade 2 Addition & Subtraction with visual blocks, update difficulty ranges"

### 10. Common Tasks & Locations

**To test new feature:**
1. Start both servers (Terminal 1 & 2)
2. Open http://localhost:8000
3. Check browser DevTools (F12) for errors
4. Check Terminal 1 (Flask) for API errors

**To add a new grade feature:**
1. Add generator function in `backend/grades/grade_X.py`
2. Update condition in `backend/app.py` line 285+ if visual needed
3. Add frontend rendering logic in `frontend/app.js` (search for "loadQuestion")
4. Test in browser with both servers running

**To modify difficulty ranges:**
1. Edit `backend/grades/grade_X.py` (line 8-9 for addition)
2. Update docs: `docs/grading/GRADE_NUMBER_LIMITS.md`
3. Restart backend (auto-reload should work)
4. Test in browser

**To commit and push:**
1. Use Terminal 3+ (NOT where servers are running)
2. `git status` → `git add -A` → `git commit -m "..."` → `git push origin feature/grade-1-subtraction`

### 11. Ports & URLs
- Backend API: http://127.0.0.1:5000
- Frontend UI: http://localhost:8000
- API Endpoints: `http://127.0.0.1:5000/api/question`, `/api/answer`, `/api/get_answer`

### 12. Error Indicators & Solutions
| Error | Solution |
|-------|----------|
| "Cannot GET /" | Frontend server not running (Terminal 2) |
| "Connection refused" | Backend server not running (Terminal 1) |
| "Address already in use" | Kill old process: `taskkill /PID <PID> /F` |
| Blank page | Cache bust: Ctrl+Shift+R or add ?t=TIMESTAMP |
| SVG not showing | Check visibility AND display properties in CSS |
| Block doesn't render | Check chartContainer display/visibility/opacity |

### 13. Code Patterns to Remember
**Block rendering pattern:**
```javascript
// Always use sectionsPerBlock parameter
renderBlocksForNumber(visual.first, '#4CAF50', 5);    // Grade 1: 5 sections
renderBlocksForNumber(visual.first, '#4CAF50', 10);   // Grade 2: 10 sections
```

**Solution reveal pattern:**
```javascript
if (currentSection === 'addition') {
    revealAdditionSolution(currentGrade, currentSection);
} else if (currentSection === 'subtraction') {
    revealSubtractionSolution(currentGrade, currentSection);
}
```

**New grade addition pattern:**
1. Backend: `generate_<op>_question()` function
2. Backend: Update API condition to include grade
3. Frontend: Add rendering function `render<Grade><Operation>()`
4. Frontend: Add condition in loadQuestion()
5. Frontend: Add solution reveal call

---

## HOW TO USE THIS FILE

This file is a reference for me (AI Assistant) to remember project context.

**If I forget something:**
- Ask user: "Let me check the project notes..."
- I'll reference this file
- Quick recovery without re-asking

**When you make changes:**
- Update this file in CONTEXT section
- Commit with other changes
- Include in commit message for visibility

**Critical rule:** If I start a session and don't mention TWO TERMINALS required, remind me!

---

**Last Session:** November 22, 2025 - Documentation reorganization complete
**Next Session:** Test Grade 3-6 ranges, implement Grade 1 Subtraction
