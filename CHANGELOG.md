# Changelog

All notable changes to the Math Quiz Website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-30

### 🔧 Maintenance Release

#### Added
- Version control workflow documentation (VERSION_CONTROL_GUIDE.md)
- Automatic AI assistant reminders for version management
- Version info in README.md with badge

#### Improved
- Enhanced AI_CONTEXT.md with version control instructions
- Better documentation of release procedures
- Clear semantic versioning guidelines

#### Documentation
- Created comprehensive VERSION_CONTROL_GUIDE.md for future releases
- Updated AI_CONTEXT.md with version control workflow
- Version control system fully documented and ready for team use

---

## [1.0.0] - 2025-11-30

### ✨ Initial Release - Production Ready

#### Added
- **Multi-grade support**: Grades 1-6 with progressive difficulty
  - Grade 1: Addition with 5-section block visualization
  - Grade 2: Addition & Subtraction with 10-section block visualization
  - Grade 3: Addition, Subtraction, Multiplication tables (2-10)
  - Grade 4: Addition, Subtraction, Multiplication (11-20), Division with remainders, Word problems
  - Grade 5: All operations, Fractions (same denominator), Charts/Graphs
  - Grade 6: All operations, Fractions (different denominators), Charts/Graphs

- **Visual Learning Features**
  - SVG block visualization for Grade 1-2 addition/subtraction
  - Pie chart visualizations for fractions (Grades 5-6)
  - Chart/graph questions for data interpretation (Grades 5-6)
  - Word problem templates with emojis and real-world scenarios

- **User Experience**
  - User authentication (name & email input)
  - Student name display and score tracking
  - Grade selection dropdown with dynamic section availability
  - Multiple math sections per grade (Addition, Subtraction, etc.)
  - 3-attempt system with progressive point deduction (10, 8, 6 points)
  - Admin mode (Ctrl+Shift+A) to view correct answers

- **Data Persistence**
  - localStorage for session persistence
  - Firebase Firestore integration (with localStorage fallback)
  - Session history tracking with timestamps
  - Automatic grade and section restoration on page reload

- **Deployment**
  - Live deployment on Render Web Service
  - Auto-deployment on GitHub push
  - Environment auto-detection (localhost vs production)
  - Flask backend serving both API and frontend files

#### Fixed
- Grade 5-6 fractions not displaying (added fraction_visual to API response)
- Grade 5-6 charts disabled (enabled in updateAvailableSections)
- Fraction SVG color bleeding (individual path elements per slice)
- Page refresh losing session state (added localStorage fallback)
- Firebase connectivity timeout issues (5-8 second timeout with fallback)

#### Improved
- Responsive CSS layout (3-column: sidebar, center, charts)
- Mobile-friendly button styling and inputs
- Clear visual feedback for disabled sections
- Comprehensive error handling and logging

### 🎯 Features by Grade

| Grade | Operations | Special | Points |
|-------|-----------|---------|--------|
| 1 | Addition (1-9, sum≤20) | 5-block visualization | 10/8/6 |
| 2 | Add, Sub (1-20, sum≤30) | 10-block visualization | 10/8/6 |
| 3 | Add, Sub, Mult (2-10 tables) | — | 10/8/6 |
| 4 | Add, Sub, Mult, Div + Word Problems | Remainder support | 10/8/6 |
| 5 | All ops + Fractions + Charts | Same denom fractions, pie charts | 10/8/6 |
| 6 | All ops + Fractions + Charts | Diff denom fractions, pie charts | 10/8/6 |

### 📊 Session & History System
- Save individual quiz sessions
- View complete session history
- Track scores, accuracy, and timestamps
- Session data includes all questions and answers

### 🔒 Security
- Firebase credentials removed from public repo
- Sensitive config in environment variables (ready for setup)
- localStorage data only stored locally per device

### 🧪 Testing Status
- ✅ All grades (1-6) functional
- ✅ All sections working
- ✅ Visual explanations displaying correctly
- ✅ Session save/load working with localStorage
- ✅ Deployment on Render live and accessible

### 📦 Tech Stack
- **Backend**: Flask 3.0.3, Python 3.8+
- **Frontend**: Vanilla JavaScript (1598 lines)
- **Styling**: CSS with responsive design
- **Storage**: localStorage, Firebase Firestore (optional)
- **Deployment**: Render Web Service
- **CI/CD**: GitHub auto-deployment

### 📝 Known Limitations
- Firebase requires proper configuration for full functionality
- localStorage limited to ~5-10MB (sufficient for 100+ sessions)
- Chart questions limited to 3 sub-questions per chart
- Fractions limited to denominators 2-9

### 🚀 Planned for v1.1.0
- Prevent duplicate wrong answer submissions
- Dashboard with student history charts
- Progress analytics and statistics
- Mobile-responsive improvements
- Export session data feature

### 🔗 Links
- **Live App**: https://math-quiz-website-ksfl.onrender.com/
- **GitHub**: https://github.com/plasmicshree/math-quiz-website
- **Deployment Guide**: docs/DEPLOYMENT_GUIDE.md
- **Architecture**: README.md

---

## Version Notes

### Semantic Versioning (MAJOR.MINOR.PATCH)
- **MAJOR**: Breaking changes or significant new features (1.0.0 → 2.0.0)
- **MINOR**: New features, non-breaking (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes only (1.0.0 → 1.0.1)

### Release Procedure
1. Update VERSION file with new version number
2. Update CHANGELOG.md with changes
3. Commit: `git commit -m "Release v1.1.0"`
4. Tag: `git tag -a v1.1.0 -m "Release version 1.1.0"`
5. Push: `git push origin main --tags`

---

**Last Updated**: November 30, 2025
