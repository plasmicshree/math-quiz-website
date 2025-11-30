# Math Quiz Website

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-lightgrey)](https://flask.palletsprojects.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![GitHub stars](https://img.shields.io/github/stars/plasmicshree/math-quiz-website)](https://github.com/plasmicshree/math-quiz-website/stargazers)

A grade-based interactive math quiz application supporting grades 1-6 with dynamic question generation, visual explanations, and instant feedback.

**Current Version**: [v1.0.1](CHANGELOG.md) - Production Ready ✅

## 🚀 Live Application

**[Math Quiz Website](https://math-quiz-website-ksfl.onrender.com/)** - Visit the live app!

Deployed on [Render](https://render.com/) with auto-deployment on every push to main branch.

## Project Structure

```
math_quiz_website/
├── backend/
│   ├── app.py              # Flask API server
│   ├── grades/             # Grade-specific question generators
│   │   ├── grade_1.py      # Addition only (1-20)
│   │   ├── grade_2.py      # Addition, Subtraction (1-100)
│   │   ├── grade_3.py      # +Multiplication (1-100)
│   │   ├── grade_4.py      # +Division, Word Problems
│   │   ├── grade_5.py      # +Fractions (same denom 2-8), Charts (10-99)
│   │   └── grade_6.py      # +Fractions (diff denom 2-9), Charts (100-999)
│   └── data/
│       ├── graphs/chart_problems.csv          # Chart templates
│       └── word_problems/
│           ├── addition_templates.csv
│           └── subtraction_templates.csv
└── frontend/
    ├── index.html          # Main UI
    ├── app.js              # JavaScript logic (537 lines)
    └── styles.css          # Styling

```

## Features by Grade Level

| Grade | Operations | Special Features |
|-------|-----------|------------------|
| 1 | Addition (1-20) | - |
| 2 | Addition, Subtraction (1-100) | - |
| 3 | +Multiplication | - |
| 4 | +Division with remainder | Word problems (CSV templates) |
| 5 | All operations | **Fractions** (same denom), **Charts** |
| 6 | All operations | **Fractions** (diff denom), **Charts** |

## Key Features

### 1. Fraction System

#### Grade 5: Same Denominator (2-8)
- **Visual**: Pie charts with colored lobes
- **Colors**: Green (first fraction), Blue (second fraction)
- **Method**: Keep denominator, add numerators
- **Display**: Hidden until answer submitted or 3 attempts used
- **Example**: 2/5 + 3/5 = 5/5 = 1.00

#### Grade 6: Different Denominators (2-9)
- **Method**: Cross-multiplication
  - Step 1: (a × d₂) + (b × d₁) = numerator
  - Step 2: d₁ × d₂ = denominator
  - Step 3: Convert to decimal
- **Display**: Steps shown, calculation hidden until earned
- **Formatting**: Proper fraction display (numerator over line over denominator)

### 2. Chart Questions
- Dynamic value generation based on grade
- 3 sub-questions per chart (CSV-driven)
- Question types:
  - "Which has the highest/lowest value?"
  - "What is the total/average?"
  - "How many more is X than Y?"
- Auto-calculated answers based on generated values

### 3. Word Problems (Grades 4+)
- CSV-based templates with categories and emojis
- Applied to addition and subtraction
- Randomly selected from template pool

### 4. Admin Mode
- **Activation**: Press `Ctrl+Shift+A`
- **Features**:
  - Shows correct answers
  - Skip button appears
  - Useful for testing

### 5. Scoring System
- Attempt 1: 10 points
- Attempt 2: 8 points
- Attempt 3: 6 points
- After 3 attempts: Shows answer, 0 points

## Running the Application

### Live Deployment
Visit the live app: **https://math-quiz-website-ksfl.onrender.com/**

### Local Development

**Backend (Flask Server)**
```bash
cd backend
poetry install
poetry run flask run
```
Server: `http://127.0.0.1:5000`

**Frontend (HTTP Server)**
```bash
cd frontend
python -m http.server 8000
```
Access: `http://localhost:8000`

### Alternative - Backend serves Frontend
The backend Flask server can serve the frontend files directly:
```bash
cd backend
poetry run flask run
```
Then visit: `http://127.0.0.1:5000`

## API Reference

### `GET /api/question`
**Parameters:**
- `section`: addition, subtraction, multiplication, division, fractions, charts
- `grade`: 1-6

**Response:**
```json
{
  "question": "What is 2/3 + 1/4?",
  "id": "uuid",
  "section": "fractions",
  "fraction_visual": {
    "numerator1": 2,
    "denominator1": 3,
    "numerator2": 1,
    "denominator2": 4,
    "same_denominator": false
  },
  "answer": 0.92,
  "fraction": "2/3 + 1/4"
}
```

### `POST /api/answer`
**Body:**
```json
{
  "id": "question-uuid",
  "answer": 0.92
}
```

**Response:**
```json
{
  "correct": true,
  "correct_answer": 0.92
}
```

### `POST /api/get_answer` (Admin)
Returns correct answer for testing.

## Recent Development Sessions

### Latest (Nov 30, 2025) - Deployment & Rendering Fixes
- ✅ Fixed chart-container visibility issue for Division, Fractions, and Charts sections
- ✅ Added proper CSS visibility and opacity properties to override `display: none` default
- ✅ Deployed backend to Render Web Service
- ✅ Configured environment auto-detection (localhost vs production)
- ✅ Live app now available at https://math-quiz-website-ksfl.onrender.com/
- ✅ Grade 4 Division explanation panel now rendering correctly
- ✅ Grade 5 Charts and Grade 6 Fractions ready for testing

### Previous Session (Nov 21, 2025)

### Issues Fixed
1. ✅ Fraction SVGs not displaying for Grade 5
2. ✅ Charts disabled for grades 5-6
3. ✅ Answer showing immediately (should be hidden)
4. ✅ SVG colors bleeding across lobes
5. ✅ Incorrect Grade 6 explanation (was using LCM instead of cross-multiplication)

### Changes Made

#### Backend (`grades/grade_5.py`, `grades/grade_6.py`)
- Added `fraction_visual` dict to return values
- Grade 5: `denominator = random.randint(2, 8)` (increased from 6)
- Grade 6: Different denominators, ensured they differ

#### Backend (`app.py`)
- Updated `/api/question` to include `fraction_visual` in response

#### Frontend (`app.js`)
- **Lines 39-90**: Fixed `updateAvailableSections()` - removed charts from disabled list for grades 5-6
- **Lines 170-178**: Added fraction formatting in question text using HTML/CSS
- **Lines 184-330**: Complete rewrite of fraction visualization:
  - Dynamic SVG generation based on API data
  - Individual path elements for each colored lobe (no bleeding)
  - Polar coordinate calculation: `angle = startAngle + (sliceIndex * anglePerSlice)`
  - Grade 5: Pie chart visualization with calculation steps
  - Grade 6: Cross-multiplication method with formatted fractions
- **Lines 318-345**: Hidden explanation section (`#fraction-explanation-hidden`)
- **Lines 440-485**: Added reveal logic - show hidden div on correct answer or after 3 attempts

### Technical Implementation Details

#### Fraction Display Formatting
```javascript
// Converts "2/3" to proper stacked fraction
const formatted = text.replace(/(\d+)\/(\d+)/g, 
  '<span style="display:inline-block;text-align:center;vertical-align:middle;">' +
  '<span style="display:block;border-bottom:1px solid #000;padding:0 4px;">$1</span>' +
  '<span style="display:block;padding:0 4px;">$2</span></span>');
```

#### SVG Generation Pattern
```javascript
const anglePerSlice = 360 / denominator;
for (let i = 0; i < numerator; i++) {
  const startAngle = (i * anglePerSlice) * Math.PI / 180;
  const endAngle = ((i + 1) * anglePerSlice) * Math.PI / 180;
  // Create individual path for this slice
  const path = `M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`;
}
```

## Dependencies

**Backend:**
- Flask
- Flask-CORS
- Python 3.10+

**Frontend:**
- Vanilla JavaScript (no frameworks)
- Modern browser with ES6 support

## Data Files Format

### Chart Problems CSV
```csv
ID,GraphType,Title,Labels,Values,Question1,Question2,Question3,Answer1,Answer2,Answer3,MinGrade
```

### Word Problem Templates CSV
```csv
ID,Template,Category,Emoji
1,"You have {a} apples and get {b} more...",Simple,🍎
```

## Known Behaviors

- Fractions accept 5% tolerance for rounding differences
- Division requires exact quotient and remainder
- Charts case-insensitive for text answers
- Grade selection persists in localStorage

## Future Enhancements

- [ ] Visual diagrams for Grade 6 cross-multiplication
- [ ] More word problem templates
- [ ] Additional chart types (bar, line)
- [ ] Progress tracking and history
- [ ] Printable worksheets
- [ ] Timed challenges

## Development Notes

### To Resume Development:
1. Start Flask server from `backend/` directory
2. Open `index.html` in browser
3. Use admin mode (Ctrl+Shift+A) for testing
4. Check browser console for any JavaScript errors
5. Check terminal for Flask API errors

### Key Files to Reference:
- **Question Generation**: `backend/grades/grade_X.py`
- **Fraction Logic**: `frontend/app.js` lines 184-330
- **API Routes**: `backend/app.py` lines 255-280
- **Chart Generation**: `backend/app.py` lines 83-170

---

**Status**: Production-ready ✅  
**Live App**: https://math-quiz-website-ksfl.onrender.com/  
**Last Updated**: November 30, 2025  
**Python Version**: 3.8+  
**Flask Version**: 3.0.3+  
**Deployment**: Render Web Service with auto-deployment

