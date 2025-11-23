# Subtraction Implementation - Conditions & Design

## Overview
Subtraction has been implemented with SVG visual block representations for Grade 1 and Grade 2, using a "Take Away" pedagogical approach.

---

## Backend Conditions

### 1. **Subtraction Question Generation** (`backend/grades/grade_2.py`)

#### Grade 2 Subtraction Conditions:
```python
section == "subtraction" and grade == 2
```

**Features:**
- Numbers: Range 1-20 (minuend from 1-20, subtrahend from 1-minuend)
- Visual representation: 10-section blocks
- Returns:
  - `minuend`: Starting number (e.g., 11)
  - `subtrahend`: Amount to subtract (e.g., 2)
  - `answer`: Result (e.g., 9)
  - `visual` dict with:
    - `total`: blocks for minuend (total sections = minuend)
    - `subtract`: blocks for subtrahend (total sections = subtrahend)
    - `result`: blocks for answer (total sections = answer)

### 2. **Word Problem Templates** (Grade 4+)

#### Condition:
```python
grade >= 4 and section == "subtraction" and SUBTRACTION_TEMPLATES
```

**Features:**
- Uses CSV templates from `backend/data/word_problems/subtraction_templates.csv`
- Templates include contextual word problems with emojis
- Numbers extracted from generated subtraction questions
- Category-based problems (scenarios like "shopping", "objects", etc.)

### 3. **API Response Endpoint** (`backend/app.py` - Line 285)

#### Condition:
```python
section == "subtraction" and grade in [1, 2]
```

**Response includes:**
```python
resp["visual"] = q.get("visual")          # Block structure data
resp["minuend"] = q.get("minuend")        # Starting amount
resp["subtrahend"] = q.get("subtrahend")  # Amount to subtract
```

---

## Frontend Conditions

### 1. **Visual Rendering Trigger** (`frontend/app.js` - Line 1036)

#### Condition:
```javascript
currentGrade === 2 && section === 'subtraction'
```

**Action:** Calls `renderGrade2Subtraction(data, chartContainer)`
- Renders problem visualization with 10-section blocks
- Separate "Start with" and "Take away" visualizations
- No overlap in problem section

### 2. **Solution Reveal Trigger** (`frontend/app.js` - Lines 1248, 1293)

#### Condition (After correct answer):
```javascript
currentSection === 'subtraction'
```

**Action:** Calls `revealSubtractionSolution(currentGrade, currentSection)`
- Shows overlaid visualization
- Red sections with ✕ crosses (subtracted amount)
- Green sections (remaining)
- Grey sections (empty block placeholders)

---

## Visualization Design

### Problem Section (Learning Phase)
**Layout:** Side-by-side comparison
```
Start with:        −        Take away:
[████] (11 green)           [█] (2 red)
[████]
[███ ]
```
**User Task:** Count only GREEN sections = 9

### Solution Section (Verification Phase)
**Layout:** Overlaid blocks with color coding
```
[██▓▓▓▓] ← Red with ✕ = removed sections
[████]
[████]
[███ ]  ← Grey = empty space

Red (2) + Green (9) = 11 total
Answer: 11 − 2 = 9
```

---

## SVG Block Structure

### Sections Per Block
- **Grade 1 Addition:** 5 sections per block
- **Grade 2 Addition:** 10 sections per block
- **Grade 2 Subtraction:** 10 sections per block

### Color Scheme
| Color | Meaning | RGB/Hex |
|-------|---------|---------|
| Green | Active/Remaining | #4CAF50 |
| Red | Removed/Subtracted | #FF6B6B |
| Grey | Empty/Placeholder | #e8e8e8 |
| White Pattern | Cross-out overlay | rgba(255,255,255,0.7) |

---

## Rendering Functions

### Generic Functions (Reusable)
1. **`renderBlocksForNumber(numberVisual, color, sectionsPerBlock)`**
   - Renders blocks with dynamic section count
   - Used for Start with, Take away, and block displays

2. **`renderSubtractionVisualization(data, chartContainer, sectionsPerBlock)`**
   - Generic subtraction renderer
   - Parameter: `sectionsPerBlock` allows reuse for other grades

### Grade-Specific Functions
1. **`renderGrade2Subtraction(data, chartContainer)`**
   - Wrapper calling `renderSubtractionVisualization` with 10 sections
   - Follows same pattern as Grade 1 & 2 Addition

### Solution Handlers
1. **`revealSubtractionSolution(grade, section)`**
   - Reveals solution div by ID: `subtraction-solution-hidden`
   - Parallel to `revealAdditionSolution()`

---

## Future Grade Support

### To add Grade 1 Subtraction:
1. Add `generate_subtraction_question()` to `backend/grades/grade_1.py`
   - Use 5 sections per block (not 10)
   - Range: 1-10 (simpler numbers)

2. Update backend condition to: `section == "subtraction" and grade in [1, 2]`
   (Already done ✓)

3. Add frontend condition:
   ```javascript
   else if (currentGrade === 1 && section === 'subtraction') {
       renderGrade1Subtraction(data, chartContainer);
   }
   ```

4. Create wrapper function:
   ```javascript
   function renderGrade1Subtraction(data, chartContainer) {
       return renderSubtractionVisualization(data, chartContainer, 5); // 5 sections for Grade 1
   }
   ```

### To add Grade 3+ Subtraction:
1. Implement word problems (already supported via CSV templates)
2. No visual blocks needed (just text-based problems)
3. Condition: `grade >= 4 and section == "subtraction"` (already implemented ✓)

---

## Key Features

✅ **Pedagogically Sound**
- Problem phase: Student counts to find answer
- Solution phase: Shows exactly what was removed
- Builds mental math skills

✅ **Scalable Architecture**
- Generic `renderSubtractionVisualization()` for any section count
- Easy to extend to other grades (just change sections per block)
- Reusable block rendering functions

✅ **Consistent Styling**
- Matches Addition visualization style
- Color-coded for clarity (Green=Active, Red=Removed, Grey=Empty)
- Cross patterns for visual distinction

✅ **Responsive Design**
- SVG-based (scales to any size)
- Dynamic block calculations based on data
- Works on desktop and tablets

---

## Data Flow

```
User selects Grade 2 → Subtraction
           ↓
Backend generates: 11 − 2 = 9 (with visual blocks for 10-section layout)
           ↓
Frontend receives: {minuend: 11, subtrahend: 2, answer: 9, visual: {...}}
           ↓
renderGrade2Subtraction() called
           ↓
Problem: Shows [11 green blocks] − [2 red blocks] = ?
           ↓
User enters answer
           ↓
If correct:
  - Score +10 points (minus attempt penalties)
  - revealSubtractionSolution() shows overlaid visualization
  - Solution shows: 2 red (removed) + 9 green (remaining) = 11
           ↓
Next button → New question
```

---

## Testing Checklist

- [x] Grade 2 Subtraction questions generate correctly
- [x] Visual blocks render with 10 sections
- [x] Problem section shows separate Start with / Take away
- [x] Solution section shows overlaid visualization
- [x] Red sections have cross pattern overlay
- [x] Grey sections show in solution for full block structure
- [x] Solution reveals only on correct answer
- [x] Multiple subtraction questions work without state pollution

---

## Files Modified

1. `backend/grades/grade_2.py` - Added `generate_subtraction_question()`
2. `backend/app.py` - Added subtraction condition (line 285)
3. `frontend/app.js` - Added:
   - `renderSubtractionVisualization()` (generic)
   - `renderGrade2Subtraction()` (Grade 2 specific)
   - `revealSubtractionSolution()` (solution reveal)
   - Updated `loadQuestion()` rendering logic (line 1036)
   - Updated solution reveal calls (lines 1248, 1293)
4. `frontend/index.html` - Updated cache-buster version

---

## Next Steps

1. **Grade 1 Subtraction:** Implement with 5-section blocks, simpler range (1-10)
2. **Grade 3 Subtraction:** Word problems without visuals
3. **Multiplication Visuals:** Array/grid visualization
4. **Division Visuals:** Grouping visualization
5. **Performance Optimization:** Cache SVG patterns

