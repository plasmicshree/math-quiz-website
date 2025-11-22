// Initialize Firebase
// Note: Firebase config should be loaded from environment or config file
// For now, Firebase is disabled due to offline connectivity issues
// TODO: Set up Firebase config as environment variable when needed
const firebaseConfig = null; // Credentials removed for security

let db = null;

if (firebaseConfig && typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✓ Firebase initialized successfully');
    db = firebase.firestore();
    console.log('✓ Firestore instance created');
  } catch (error) {
    console.error('✗ Firebase initialization error:', error);
  }
} else {
  console.log('ℹ Firebase not configured - using localStorage for session persistence');
}

// Session tracking
let currentSessionId = null;
let currentSessionData = {
  userName: '',
  grade: null,
  section: '',
  questions: [],
  totalScore: 0,
  startTime: null,
  endTime: null
};

// Function to create a new session
function startNewSession(userName, grade, section) {
  currentSessionId = generateUUID();
  currentSessionData = {
    sessionId: currentSessionId,
    userName: userName,
    grade: grade,
    section: section,
    questions: [],
    totalScore: 0,
    startTime: new Date(),
    endTime: null
  };
}

// Function to add question to session
function addQuestionToSession(question, userAnswer, correctAnswer, correct, pointsEarned) {
  currentSessionData.questions.push({
    question: question,
    userAnswer: userAnswer,
    correctAnswer: correctAnswer,
    correct: correct,
    pointsEarned: pointsEarned,
    timestamp: new Date()
  });
}

// Function to save session to Firestore (with localStorage fallback)
async function saveSessionToFirebase() {
  if (!currentSessionId) return;
  
  const userEmail = localStorage.getItem('mathQuizUserEmail');
  if (!userEmail) {
    console.error('[FIREBASE] User email not found in localStorage');
    // Save to localStorage as fallback
    saveSessionToLocalStorage(userEmail);
    return;
  }
  
  try {
    currentSessionData.endTime = new Date();
    currentSessionData.totalScore = currentSessionData.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
    
    console.log('[FIREBASE] Saving session with email:', userEmail);
    console.log('[FIREBASE] Session data:', currentSessionData);
    
    if (!db) {
      console.warn('[FIREBASE] Firebase not initialized, using localStorage fallback');
      saveSessionToLocalStorage(userEmail);
      return;
    }
    
    // Create timeout promise (8 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout - saving to localStorage')), 8000)
    );
    
    // Use email as unique identifier with timeout
    const savePromise = db.collection('users').doc(userEmail).collection('sessions').doc(currentSessionId).set(currentSessionData);
    
    await Promise.race([savePromise, timeoutPromise]);
    console.log('[FIREBASE] ✓ Session saved to Firebase');
  } catch (error) {
    console.warn('[FIREBASE] Firebase save failed, saving to localStorage instead:', error.message);
    // Fallback to localStorage
    saveSessionToLocalStorage(userEmail);
  }
}

// Fallback: Save session to localStorage
function saveSessionToLocalStorage(userEmail) {
  try {
    const sessions = JSON.parse(localStorage.getItem('mathQuizSessions') || '[]');
    currentSessionData.savedLocally = true;
    currentSessionData.savedTimestamp = new Date().toISOString();
    sessions.push(currentSessionData);
    localStorage.setItem('mathQuizSessions', JSON.stringify(sessions));
    console.log('[LOCALSTORAGE] ✓ Session saved to localStorage');
  } catch (error) {
    console.error('[LOCALSTORAGE] Error saving to localStorage:', error);
  }
}

// Function to load user sessions from Firebase
async function loadUserSessions(userEmail) {
  if (!userEmail) {
    console.error('[FIREBASE] User email not provided');
    return [];
  }
  
  try {
    // Try Firebase first
    if (db) {
      console.log('[FIREBASE] Loading sessions for email:', userEmail);
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase query timeout - using localStorage fallback')), 5000)
      );
      
      const queryPromise = db.collection('users').doc(userEmail).collection('sessions').get();
      const snapshot = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log('[FIREBASE] ✓ Snapshot received, docs count:', snapshot.size);
      
      const sessions = [];
      snapshot.forEach(doc => {
        console.log('[FIREBASE] Session doc:', doc.data());
        sessions.push(doc.data());
      });
      
      if (sessions.length > 0) {
        console.log('[FIREBASE] ✓ Loaded from Firebase:', sessions.length, 'sessions');
        return sessions;
      }
    }
  } catch (error) {
    console.warn('[FIREBASE] Firebase load failed, falling back to localStorage:', error.message);
  }
  
  // Fallback to localStorage
  try {
    console.log('[LOCALSTORAGE] Loading sessions from localStorage');
    const sessionsJson = localStorage.getItem('mathQuizSessions');
    if (!sessionsJson) {
      console.log('[LOCALSTORAGE] No sessions found in localStorage');
      return [];
    }
    
    const sessions = JSON.parse(sessionsJson);
    console.log('[LOCALSTORAGE] ✓ Loaded from localStorage:', sessions.length, 'sessions');
    return sessions;
  } catch (error) {
    console.error('[LOCALSTORAGE] Error loading from localStorage:', error);
    return [];
  }
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all DOM elements first
    const nameModal = document.getElementById('name-modal');
    const nameInput = document.getElementById('name-input');
    const nameSubmitBtn = document.getElementById('name-submit-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    const scoreTitleName = document.getElementById('score-title-name');
    const changeNameBtn = document.getElementById('change-name-btn');
    const nameDisplay = document.querySelector('.name-display');
    const emailInput = document.getElementById('email-input');
    const submitBtn = document.getElementById('submit-btn');
    const sectionSelect = document.getElementById('section-select');
    const gradeSelect = document.getElementById('grade-select');
    const saveSessionBtn = document.getElementById('save-session-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const closeHistoryBtn = document.getElementById('close-history-btn');

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Initialize grade-related variables FIRST (needed before enableApp() is called)
    const questionText = document.getElementById('question-text');
    const answerFields = document.getElementById('answer-fields');
    let answerInput = document.getElementById('answer-input');
    const resultDiv = document.getElementById('result');
    const nextBtn = document.getElementById('next-btn');
    const adminSkipBtn = document.getElementById('admin-skip-btn');
    let currentQuestionId = null;
    let currentSection = sectionSelect.value;
    let currentGrade = null;
    let attemptCount = 0;
    const maxAttempts = 3;
    let score = 0;
    const scoreValue = document.getElementById('score-value');
    let isAdminMode = false;
    let currentCorrectAnswer = null;

    // Restore saved grade BEFORE authentication check (needed for enableApp -> updateAvailableSections)
    const savedGrade = localStorage.getItem('mathQuizGrade');
    if (savedGrade) {
        gradeSelect.value = savedGrade;
        currentGrade = parseInt(savedGrade);
        console.log('[INIT] Restored saved grade:', savedGrade);
        
        // Restore the section
        currentSection = 'addition';
        sectionSelect.value = 'addition';
    }

    // Check if user has a saved name
    const savedName = localStorage.getItem('mathQuizUserName');
    const savedEmail = localStorage.getItem('mathQuizUserEmail');
    
    console.log('[AUTH] Checking for saved user - Name:', savedName, 'Email:', savedEmail);
    
    if (savedName && savedEmail) {
        console.log('[AUTH] ✓ User already authenticated, restoring...');
        userNameDisplay.textContent = savedName;
        scoreTitleName.textContent = savedName;
        nameModal.classList.add('hidden');
        nameDisplay.classList.remove('hidden');
        console.log('[AUTH] Modal hidden:', nameModal.classList.contains('hidden'));
        console.log('[AUTH] Display visible:', !nameDisplay.classList.contains('hidden'));
        // Enable app features if user is already authenticated
        enableApp();
        console.log('[AUTH] ✓ App enabled');
    } else {
        console.log('[AUTH] No saved user, showing modal');
        // Make sure modal is visible if no saved name
        nameModal.classList.remove('hidden');
        nameDisplay.classList.add('hidden');
        nameInput.focus();
    }

    // Handle name submission
    nameSubmitBtn.addEventListener('click', submitName);
    
    function submitName() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        
        // Validate inputs
        if (name.length === 0) {
            alert('Please enter your name.');
            nameInput.focus();
            return;
        }
        
        if (email.length === 0) {
            alert('Please enter your email.');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address (e.g., user@example.com)');
            emailInput.focus();
            return;
        }
        
        // Save both name and email
        localStorage.setItem('mathQuizUserName', name);
        localStorage.setItem('mathQuizUserEmail', email);
        userNameDisplay.textContent = name;
        scoreTitleName.textContent = name;
        nameModal.classList.add('hidden');
        nameDisplay.classList.remove('hidden');
        nameInput.value = '';
        emailInput.value = '';
        
        // Enable app features so user can select grade
        enableApp();
        
        // Focus on grade selector for user to choose
        gradeSelect.focus();
        
        document.body.focus();
    }

    // Allow Enter key to submit name
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            emailInput.focus();
        }
    });
    
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });

    // Change name button
    changeNameBtn.addEventListener('click', () => {
        nameInput.value = userNameDisplay.textContent;
        emailInput.value = localStorage.getItem('mathQuizUserEmail') || '';
        nameModal.classList.remove('hidden');
        nameDisplay.classList.add('hidden');
        nameInput.focus();
    });

    // Grade restoration code moved up to before authentication check

    // Continue with session restoration if grade was saved
    if (savedGrade) {
        // Get saved username for session
        const savedUserName = localStorage.getItem('mathQuizUserName') || 'User';
        
        // Initialize session with restored grade
        startNewSession(savedUserName, currentGrade, 'addition');
        
        // Update available sections based on grade
        updateAvailableSections();
        
        // Enable app features
        enableApp();
        
        console.log('[INIT] Loading first question for section:', currentSection);
        loadQuestion(currentSection);
    }

    gradeSelect.addEventListener('change', (e) => {
        const grade = e.target.value;
        console.log('[GRADE] Grade selected:', grade);
        if (grade) {
            currentGrade = parseInt(grade);
            localStorage.setItem('mathQuizGrade', grade);
            // Start new session when grade is selected
            startNewSession(userNameDisplay.textContent, currentGrade, 'addition');
            enableApp();
            updateAvailableSections();
            // Set default section to addition
            currentSection = 'addition';
            sectionSelect.value = 'addition';
            console.log('[GRADE] Loading first question for section:', currentSection);
            loadQuestion(currentSection);
        }
    });

    function updateAvailableSections() {
        const options = sectionSelect.options;
        
        for (let i = 0; i < options.length; i++) {
            options[i].disabled = false;
            options[i].style.color = '';
            options[i].style.opacity = '';
        }
        
        if (currentGrade === 1) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value !== 'addition') {
                    options[i].disabled = true;
                    options[i].style.color = '#b0b8c1';
                    options[i].style.opacity = '0.5';
                }
            }
        } else if (currentGrade === 2) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value !== 'addition' && options[i].value !== 'subtraction') {
                    options[i].disabled = true;
                    options[i].style.color = '#b0b8c1';
                    options[i].style.opacity = '0.5';
                }
            }
        } else if (currentGrade === 3) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === 'division' || options[i].value === 'fractions' || options[i].value === 'charts') {
                    options[i].disabled = true;
                    options[i].style.color = '#b0b8c1';
                    options[i].style.opacity = '0.5';
                }
            }
        } else if (currentGrade === 4) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === 'fractions' || options[i].value === 'charts') {
                    options[i].disabled = true;
                    options[i].style.color = '#b0b8c1';
                    options[i].style.opacity = '0.5';
                }
            }
        } else if (currentGrade >= 5) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === 'fractions') {
                    options[i].disabled = false;
                }
                if (options[i].value === 'charts') {
                    options[i].disabled = false;
                }
            }
        }
        
        const currentOption = Array.from(options).find(opt => opt.value === currentSection);
        if (currentOption && currentOption.disabled) {
            sectionSelect.value = 'addition';
            currentSection = 'addition';
        }
    }

    function enableApp() {
        console.log('[APP] Enabling app features after user authentication');
        
        // Enable all disabled-overlay elements
        document.querySelectorAll('.disabled-overlay').forEach(el => {
            el.classList.add('enabled');
        });
        
        // Specifically enable grade selector
        const gradeSelectorContainer = document.getElementById('grade-selector-container');
        const gradeSelect = document.getElementById('grade-select');
        
        if (gradeSelectorContainer) {
            gradeSelectorContainer.classList.remove('disabled-overlay');
        }
        if (gradeSelect) {
            gradeSelect.disabled = false;
        }
        
        // Enable other controls
        sectionSelect.disabled = false;
        submitBtn.disabled = false;
        saveSessionBtn.disabled = false;
        viewHistoryBtn.disabled = false;
        
        console.log('[APP] ✓ App features enabled');
        updateAvailableSections();
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            isAdminMode = !isAdminMode;
            if (isAdminMode) {
                adminSkipBtn.classList.add('visible');
                adminSkipBtn.disabled = false;
                console.log('Admin mode enabled');
                if (currentCorrectAnswer !== null) {
                    updateAdminAnswerDisplay();
                }
            } else {
                adminSkipBtn.classList.remove('visible');
                adminSkipBtn.disabled = true;
                console.log('Admin mode disabled');
                clearAdminAnswerDisplay();
            }
        }
    });

    function updateAdminAnswerDisplay() {
        if (!isAdminMode || currentCorrectAnswer === null) return;
        
        if (currentSection === 'division') {
            const displayEl = document.getElementById('admin-answer-display');
            if (displayEl) {
                displayEl.textContent = `✓ Answer: Q=${currentCorrectAnswer.quotient}, R=${currentCorrectAnswer.remainder}`;
            }
        } else if (currentSection === 'charts') {
            for (let i = 0; i < 3; i++) {
                const displayEl = document.getElementById(`admin-answer-display-${i}`);
                if (displayEl && Array.isArray(currentCorrectAnswer)) {
                    displayEl.textContent = `✓ ${currentCorrectAnswer[i]}`;
                }
            }
        } else {
            const displayEl = document.getElementById('admin-answer-display');
            if (displayEl) {
                displayEl.textContent = `✓ Answer: ${currentCorrectAnswer}`;
            }
        }
    }

    function clearAdminAnswerDisplay() {
        const displayEl = document.getElementById('admin-answer-display');
        if (displayEl) {
            displayEl.textContent = '';
        }
        if (currentSection === 'charts') {
            for (let i = 0; i < 3; i++) {
                const displayEl = document.getElementById(`admin-answer-display-${i}`);
                if (displayEl) {
                    displayEl.textContent = '';
                }
            }
        }
    }

    function loadQuestion(section) {
        console.log('[QUESTION] Loading question for section:', section, 'grade:', currentGrade);
        
        if (!currentGrade) {
            console.error('[QUESTION] No grade selected');
            questionText.textContent = 'Please select a grade to begin.';
            return;
        }
        
        const apiUrl = `http://127.0.0.1:5000/api/question?section=${section}&grade=${currentGrade}`;
        console.log('[QUESTION] Fetching from:', apiUrl);
        
        fetch(apiUrl)
            .then(res => {
                console.log('[QUESTION] Response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('[QUESTION] ✓ Received question:', data);
                if (!data.question) {
                    throw new Error('No question in response');
                }
                // Format fractions properly in question text
                if (section === 'fractions' && data.question) {
                    // Replace "1/2" with proper fraction display
                    const formattedQuestion = data.question.replace(/(\d+)\/(\d+)/g, '<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;border-bottom:1px solid #000;padding:0 4px;">$1</span><span style="display:block;padding:0 4px;">$2</span></span>');
                    questionText.innerHTML = formattedQuestion;
                } else {
                    questionText.textContent = data.question;
                }
                currentQuestionId = data.id;
                currentSection = section;
                currentCorrectAnswer = null;
                answerFields.innerHTML = '';
                const chartContainer = document.getElementById('chart-container');
                chartContainer.innerHTML = '';
                chartContainer.style.display = 'none';
                if (section === 'division') {
                    answerFields.innerHTML = `
                        <input type="number" id="quotient-input" placeholder="Quotient">
                        <input type="number" id="remainder-input" placeholder="Remainder" style="margin-left:8px;">
                        <span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>
                    `;
                } else if (section === 'fractions' && data.fraction_visual) {
                    const grade = parseInt(document.getElementById('grade-select').value);
                    const fv = data.fraction_visual;
                    let explanationHtml = '<div style="padding:16px;font-size:0.95rem;line-height:1.6;">';
                    explanationHtml += '<div style="font-weight:600;font-size:1.1rem;margin-bottom:12px;">📐 How to Add Fractions</div>';
                    
                    if (grade === 5 && fv.same_denominator) {
                        explanationHtml += '<div style="margin-bottom:12px;"><strong>Grade 5: Same Denominator</strong></div>';
                        explanationHtml += '<div style="margin-bottom:12px;">When fractions have the same denominator, keep the denominator and add the numerators.</div>';
                        explanationHtml += '<div style="margin-bottom:12px;"><strong>Steps:</strong></div>';
                        explanationHtml += '<ol style="margin-left:20px;padding-left:0;">';
                        explanationHtml += '<li>Keep the same denominator</li>';
                        explanationHtml += '<li>Add the numerators</li>';
                        explanationHtml += '<li>Divide the result to get decimal</li>';
                        explanationHtml += '<li>Round to 2 decimal places</li>';
                        explanationHtml += '</ol>';
                        explanationHtml += '<div id="fraction-explanation-hidden" style="display:none;">';
                        explanationHtml += `<div style="margin-bottom:12px;margin-top:16px;"><strong>Visual Explanation for ${fv.numerator1}/${fv.denominator} + ${fv.numerator2}/${fv.denominator}:</strong></div>`;
                        
                        explanationHtml += '<div id="fraction-animation-wrapper" style="position:relative;display:flex;align-items:center;justify-content:space-around;margin-bottom:16px;min-height:110px;isolation:isolate;">';
                        
                        const anglePerSlice = 360 / fv.denominator;
                        
                        explanationHtml += '<div style="text-align:center;position:relative;z-index:1;">';
                        explanationHtml += '<svg width="80" height="80" viewBox="0 0 100 100">';
                        explanationHtml += '<circle cx="50" cy="50" r="40" fill="#d3d3d3" stroke="#000" stroke-width="1"/>';
                        
                        for (let i = 0; i < fv.numerator1; i++) {
                            const startAngle = (i * anglePerSlice) * Math.PI / 180;
                            const endAngle = ((i + 1) * anglePerSlice) * Math.PI / 180;
                            const xStart = 50 + 40 * Math.cos(startAngle);
                            const yStart = 50 + 40 * Math.sin(startAngle);
                            const xEnd = 50 + 40 * Math.cos(endAngle);
                            const yEnd = 50 + 40 * Math.sin(endAngle);
                            explanationHtml += `<path d="M 50 50 L ${xStart.toFixed(2)} ${yStart.toFixed(2)} A 40 40 0 0 1 ${xEnd.toFixed(2)} ${yEnd.toFixed(2)} Z" fill="#4CAF50"/>`;
                        }
                        
                        for (let i = 0; i < fv.denominator; i++) {
                            const angle = (i * anglePerSlice) * Math.PI / 180;
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 + 40 * Math.sin(angle);
                            explanationHtml += `<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000" stroke-width="1"/>`;
                        }
                        explanationHtml += '</svg>';
                        explanationHtml += `<div style="margin-top:4px;font-size:0.85rem;">${fv.numerator1}/${fv.denominator}</div>`;
                        explanationHtml += '</div>';
                        
                        explanationHtml += '<div style="font-size:1.2rem;font-weight:bold;z-index:1;position:relative;">+</div>';
                        
                        explanationHtml += '<div style="text-align:center;position:relative;width:80px;z-index:1;">';
                        explanationHtml += '<svg width="80" height="80" viewBox="0 0 100 100">';
                        explanationHtml += '<circle cx="50" cy="50" r="40" fill="#d3d3d3" stroke="#000" stroke-width="1"/>';
                        
                        for (let i = 0; i < fv.numerator2; i++) {
                            const startAngle = (i * anglePerSlice) * Math.PI / 180;
                            const endAngle = ((i + 1) * anglePerSlice) * Math.PI / 180;
                            const xStart = 50 + 40 * Math.cos(startAngle);
                            const yStart = 50 + 40 * Math.sin(startAngle);
                            const xEnd = 50 + 40 * Math.cos(endAngle);
                            const yEnd = 50 + 40 * Math.sin(endAngle);
                            explanationHtml += `<path d="M 50 50 L ${xStart.toFixed(2)} ${yStart.toFixed(2)} A 40 40 0 0 1 ${xEnd.toFixed(2)} ${yEnd.toFixed(2)} Z" fill="#2196F3"/>`;
                        }
                        
                        for (let i = 0; i < fv.denominator; i++) {
                            const angle = (i * anglePerSlice) * Math.PI / 180;
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 + 40 * Math.sin(angle);
                            explanationHtml += `<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000" stroke-width="1"/>`;
                        }
                        explanationHtml += '</svg>';
                        explanationHtml += `<div style="margin-top:4px;font-size:0.85rem;">${fv.numerator2}/${fv.denominator}</div>`;
                        explanationHtml += '</div>';
                        
                        explanationHtml += '<div style="font-size:1.2rem;font-weight:bold;z-index:1;position:relative;">=</div>';
                        
                        const totalNumerator = fv.numerator1 + fv.numerator2;
                        explanationHtml += '<div style="text-align:center;position:relative;z-index:1;">';
                        explanationHtml += '<svg width="80" height="80" viewBox="0 0 100 100">';
                        explanationHtml += '<circle cx="50" cy="50" r="40" fill="#d3d3d3" stroke="#000" stroke-width="1"/>';
                        
                        for (let i = 0; i < fv.numerator2; i++) {
                            const startAngle = (i * anglePerSlice) * Math.PI / 180;
                            const endAngle = ((i + 1) * anglePerSlice) * Math.PI / 180;
                            const xStart = 50 + 40 * Math.cos(startAngle);
                            const yStart = 50 + 40 * Math.sin(startAngle);
                            const xEnd = 50 + 40 * Math.cos(endAngle);
                            const yEnd = 50 + 40 * Math.sin(endAngle);
                            explanationHtml += `<path d="M 50 50 L ${xStart.toFixed(2)} ${yStart.toFixed(2)} A 40 40 0 0 1 ${xEnd.toFixed(2)} ${yEnd.toFixed(2)} Z" fill="#2196F3"/>`;
                        }
                        
                        for (let i = 0; i < fv.numerator1; i++) {
                            const startAngle = ((fv.numerator2 + i) * anglePerSlice) * Math.PI / 180;
                            const endAngle = ((fv.numerator2 + i + 1) * anglePerSlice) * Math.PI / 180;
                            const xStart = 50 + 40 * Math.cos(startAngle);
                            const yStart = 50 + 40 * Math.sin(startAngle);
                            const xEnd = 50 + 40 * Math.cos(endAngle);
                            const yEnd = 50 + 40 * Math.sin(endAngle);
                            explanationHtml += `<path d="M 50 50 L ${xStart.toFixed(2)} ${yStart.toFixed(2)} A 40 40 0 0 1 ${xEnd.toFixed(2)} ${yEnd.toFixed(2)} Z" fill="#4CAF50"/>`;
                        }
                        
                        for (let i = 0; i < fv.denominator; i++) {
                            const angle = (i * anglePerSlice) * Math.PI / 180;
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 + 40 * Math.sin(angle);
                            explanationHtml += `<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000" stroke-width="1"/>`;
                        }
                        explanationHtml += '</svg>';
                        explanationHtml += `<div style="margin-top:4px;font-size:0.85rem;">${totalNumerator}/${fv.denominator}</div>`;
                        explanationHtml += '</div>';
                        
                        explanationHtml += '</div>';
                        
                        const emptySlices = fv.denominator - totalNumerator;
                        const decimalValue = (totalNumerator / fv.denominator).toFixed(4);
                        const roundedValue = data.answer;
                        
                        explanationHtml += '<div style="margin-bottom:8px;margin-top:12px;"><strong>Calculation:</strong></div>';
                        explanationHtml += '<ol style="margin-left:20px;padding-left:0;">';
                        explanationHtml += `<li>Keep the same denominator: <strong>${fv.denominator}</strong></li>`;
                        explanationHtml += `<li>Add the numerators: <strong>${fv.numerator1} + ${fv.numerator2} = ${totalNumerator}</strong></li>`;
                        explanationHtml += `<li>Result: <strong>${totalNumerator}/${fv.denominator}</strong> (${emptySlices === 0 ? 'full circle' : emptySlices === 1 ? 'only 1 slice remains empty' : `${emptySlices} slices remain empty`})</li>`;
                        explanationHtml += `<li>Divide: <strong>${totalNumerator} ÷ ${fv.denominator} = ${decimalValue}...</strong></li>`;
                        explanationHtml += `<li>Round to 2 decimals: <strong>${roundedValue}</strong></li>`;
                        explanationHtml += '</ol>';
                        explanationHtml += '</div>';
                    } else if (grade === 6 && !fv.same_denominator) {
                        explanationHtml += '<div style="margin-bottom:12px;"><strong>Grade 6: Different Denominators</strong></div>';
                        explanationHtml += '<div style="margin-bottom:8px;"><strong>Steps:</strong></div>';
                        explanationHtml += '<ol style="margin-left:20px;padding-left:0;">';
                        explanationHtml += '<li>Cross-multiply the numerators by opposite denominators and add the results to get the numerator</li>';
                        explanationHtml += '<li>Multiply the two denominators together to get the denominator</li>';
                        explanationHtml += '<li>Convert the resulting fraction to decimal and round to 2 places</li>';
                        explanationHtml += '</ol>';
                        explanationHtml += '<div id="fraction-explanation-hidden" style="display:none;">';
                        // Format fractions properly in calculation line
                        const frac1 = `<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;border-bottom:1px solid #000;padding:0 4px;">${fv.numerator1}</span><span style="display:block;padding:0 4px;">${fv.denominator1}</span></span>`;
                        const frac2 = `<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;border-bottom:1px solid #000;padding:0 4px;">${fv.numerator2}</span><span style="display:block;padding:0 4px;">${fv.denominator2}</span></span>`;
                        explanationHtml += `<div style="margin-bottom:12px;margin-top:16px;"><strong>Calculation: ${frac1} + ${frac2}</strong></div>`;
                        
                        // Cross-multiplication method
                        const crossNum = (fv.numerator1 * fv.denominator2) + (fv.numerator2 * fv.denominator1);
                        const commonDenom = fv.denominator1 * fv.denominator2;
                        const finalDecimal = data.answer;
                        
                        explanationHtml += '<div style="background:#f5f5f5;padding:12px;border-radius:4px;margin-bottom:12px;font-family:monospace;line-height:1.8;">';
                        explanationHtml += `<strong>Step 1:</strong> Cross-multiply and add numerators:<br>`;
                        explanationHtml += `&nbsp;&nbsp;(${fv.numerator1} × ${fv.denominator2}) + (${fv.numerator2} × ${fv.denominator1}) = ${fv.numerator1 * fv.denominator2} + ${fv.numerator2 * fv.denominator1} = ${crossNum}<br><br>`;
                        explanationHtml += `<strong>Step 2:</strong> Multiply denominators:<br>`;
                        explanationHtml += `&nbsp;&nbsp;${fv.denominator1} × ${fv.denominator2} = ${commonDenom}<br><br>`;
                        explanationHtml += `<strong>Step 3:</strong> Write as fraction:<br>`;
                        const resultFrac = `<span style="display:inline-block;text-align:center;vertical-align:middle;"><span style="display:block;border-bottom:1px solid #000;padding:0 4px;">${crossNum}</span><span style="display:block;padding:0 4px;">${commonDenom}</span></span>`;
                        explanationHtml += `&nbsp;&nbsp;${resultFrac}<br><br>`;
                        explanationHtml += `<strong>Step 4:</strong> Convert to decimal:<br>`;
                        explanationHtml += `&nbsp;&nbsp;${crossNum} ÷ ${commonDenom} = ${finalDecimal}`;
                        explanationHtml += '</div>';
                        explanationHtml += '</div>';
                    }
                    
                    explanationHtml += '</div>';
                    chartContainer.innerHTML = explanationHtml;
                    chartContainer.style.display = 'block';
                    answerFields.innerHTML = `<input type="number" id="answer-input" placeholder="Your answer" step="0.01"><span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>`;
                } else if (section === 'charts' && data.chart && data.sub_questions) {
                    let chartHtml = '';
                    if (data.chart.title) {
                        chartHtml += `<div style="font-weight:600;font-size:1.1rem;margin-bottom:8px;word-wrap:break-word;">${data.chart.title}</div>`;
                    }
                    chartHtml += '<table id="chart-table" style="margin-bottom:12px;width:100%;table-layout:fixed;border-collapse:collapse;text-align:center;">';
                    chartHtml += '<tr>';
                    data.chart.labels.forEach(label => {
                        chartHtml += `<th style="border-bottom:1.5px solid #b0b8c1;padding:4px 2px;font-size:0.85rem;">${label}</th>`;
                    });
                    chartHtml += '</tr><tr>';
                    data.chart.values.forEach(val => {
                        chartHtml += `<td style="padding:4px 2px;">${val}</td>`;
                    });
                    chartHtml += '</tr></table>';
                    chartContainer.innerHTML = chartHtml;
                    chartContainer.style.display = 'block';
                    let questionsHtml = '<div id="chart-questions">';
                    data.sub_questions.forEach((q, i) => {
                        questionsHtml += `<div style="margin-bottom:8px;"><label style="font-size:1rem;">${q}</label><br><input type="text" id="chart-answer-${i}" class="chart-answer-input" placeholder="Your answer"><span id="admin-answer-display-${i}" style="margin-left:12px;color:#666;font-size:0.9rem;"></span></div>`;
                    });
                    questionsHtml += '</div>';
                    answerFields.innerHTML = questionsHtml;
                } else {
                    answerFields.innerHTML = `<input type="number" id="answer-input" placeholder="Your answer"><span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>`;
                }
                answerInput = document.getElementById('answer-input') || document.getElementById('quotient-input');
                resultDiv.textContent = '';
                attemptCount = 0;
                if (section === 'division') {
                    document.getElementById('quotient-input').disabled = false;
                    document.getElementById('remainder-input').disabled = false;
                } else if (section === 'charts') {
                    for (let i = 0; i < 3; i++) {
                        document.getElementById(`chart-answer-${i}`).disabled = false;
                    }
                } else {
                    answerInput.disabled = false;
                }
                submitBtn.disabled = false;
                nextBtn.disabled = true;
                
                if (isAdminMode) {
                    fetch('http://127.0.0.1:5000/api/get_answer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: currentQuestionId })
                    })
                    .then(res => res.json())
                    .then(answerData => {
                        if (answerData.answer) {
                            currentCorrectAnswer = answerData.answer;
                            updateAdminAnswerDisplay();
                        }
                    });
                }
            })
            .catch(error => {
                console.error('[QUESTION] ✗ Error loading question:', error);
                questionText.textContent = `Error loading question: ${error.message}`;
                resultDiv.textContent = 'Failed to load question. Check the console for details.';
            });
    }

    sectionSelect.addEventListener('change', (e) => {
        loadQuestion(e.target.value);
    });

    submitBtn.addEventListener('click', () => {
        let userAnswer;
        if (currentSection === 'division') {
            const quotientInput = document.getElementById('quotient-input');
            const remainderInput = document.getElementById('remainder-input');
            const quotient = quotientInput.value;
            const remainder = remainderInput.value;
            if (currentQuestionId === null || quotient === '' || remainder === '' || isNaN(Number(quotient)) || isNaN(Number(remainder))) {
                resultDiv.textContent = 'Please enter both quotient and remainder.';
                return;
            }
            userAnswer = { quotient: Number(quotient), remainder: Number(remainder) };
        } else if (currentSection === 'charts') {
            userAnswer = [];
            for (let i = 0; i < 3; i++) {
                const val = document.getElementById(`chart-answer-${i}`).value;
                if (!val) {
                    resultDiv.textContent = 'Please answer all chart questions.';
                    return;
                }
                userAnswer.push(val);
            }
        } else {
            if (currentQuestionId === null || isNaN(Number(answerInput.value))) {
                resultDiv.textContent = 'Please enter a valid answer.';
                return;
            }
            userAnswer = Number(answerInput.value);
        }
        fetch('http://127.0.0.1:5000/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentQuestionId, answer: userAnswer })
        })
        .then(res => res.json())
        .then(data => {
            if (data.correct) {
                let points = 10 - (attemptCount * 2);
                if (points < 6) points = 6;
                score += points;
                scoreValue.textContent = score;
                resultDiv.textContent = `Correct! 🎉 (+${points} points)`;
                currentCorrectAnswer = data.correct_answer;
                
                // Add to session
                addQuestionToSession(
                  questionText.textContent,
                  userAnswer,
                  data.correct_answer,
                  true,
                  points
                );
                if (currentSection === 'division') {
                    document.getElementById('quotient-input').disabled = true;
                    document.getElementById('remainder-input').disabled = true;
                } else if (currentSection === 'charts') {
                    for (let i = 0; i < 3; i++) {
                        document.getElementById(`chart-answer-${i}`).disabled = true;
                    }
                } else if (currentSection === 'fractions') {
                    answerInput.disabled = true;
                    const hiddenExplanation = document.getElementById('fraction-explanation-hidden');
                    if (hiddenExplanation) {
                        hiddenExplanation.style.display = 'block';
                    }
                } else {
                    answerInput.disabled = true;
                }
                submitBtn.disabled = true;
                nextBtn.disabled = false;
                nextBtn.focus();
            } else if (data.correct === false) {
                attemptCount++;
                currentCorrectAnswer = data.correct_answer;
                if (attemptCount < maxAttempts) {
                    resultDiv.textContent = `Incorrect. Try again! (${attemptCount} of ${maxAttempts} attempts)`;
                    if (isAdminMode) {
                        updateAdminAnswerDisplay();
                    }
                } else {
                    resultDiv.textContent = `Incorrect. The correct answer is ${JSON.stringify(data.correct_answer)}.`;
                    
                    // Add to session (incorrect answer after max attempts = 0 points)
                    addQuestionToSession(
                      questionText.textContent,
                      userAnswer,
                      data.correct_answer,
                      false,
                      0
                    );
                    if (currentSection === 'division') {
                        document.getElementById('quotient-input').disabled = true;
                        document.getElementById('remainder-input').disabled = true;
                    } else if (currentSection === 'charts') {
                        for (let i = 0; i < 3; i++) {
                            document.getElementById(`chart-answer-${i}`).disabled = true;
                        }
                    } else if (currentSection === 'fractions') {
                        answerInput.disabled = true;
                        const hiddenExplanation = document.getElementById('fraction-explanation-hidden');
                        if (hiddenExplanation) {
                            hiddenExplanation.style.display = 'block';
                        }
                    } else {
                        answerInput.disabled = true;
                    }
                    submitBtn.disabled = true;
                    nextBtn.disabled = false;
                    nextBtn.focus();
                }
            } else {
                resultDiv.textContent = 'Error: ' + (data.error || 'Unknown error.');
            }
        });
    });

    nextBtn.addEventListener('click', () => {
        loadQuestion(currentSection);
        setTimeout(() => {
            if (currentSection === 'division') {
                document.getElementById('quotient-input').focus();
            } else if (currentSection === 'charts') {
                document.getElementById('chart-answer-0').focus();
            } else {
                answerInput.focus();
            }
        }, 100);
    });

    adminSkipBtn.addEventListener('click', () => {
        loadQuestion(currentSection);
        setTimeout(() => {
            if (currentSection === 'division') {
                document.getElementById('quotient-input').focus();
            } else if (currentSection === 'charts') {
                document.getElementById('chart-answer-0').focus();
            } else {
                answerInput.focus();
            }
        }, 100);
    });

    // Save Session Button

    saveSessionBtn.addEventListener('click', async () => {
        console.log('[SAVE] Save Session clicked');
        console.log('[SAVE] Current session data:', currentSessionData);
        console.log('[SAVE] Questions answered:', currentSessionData.questions.length);
        
        if (currentSessionData.questions.length === 0) {
            alert('No questions answered yet. Answer some questions first!');
            return;
        }
        
        saveSessionBtn.disabled = true;
        saveSessionBtn.textContent = '💾 Saving...';
        
        try {
            console.log('[SAVE] Starting save to Firebase...');
            await saveSessionToFirebase();
            console.log('[SAVE] ✓ Save successful!');
            saveSessionBtn.textContent = '✅ Saved!';
            setTimeout(() => {
                saveSessionBtn.textContent = '💾 Save Session';
                saveSessionBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('[SAVE] ✗ Error saving session:', error);
            alert('Error saving session. Check console for details.');
            saveSessionBtn.textContent = '💾 Save Session';
            saveSessionBtn.disabled = false;
        }
    });

    // View History Button
    viewHistoryBtn.addEventListener('click', async () => {
        historyModal.classList.remove('hidden');
        historyList.innerHTML = '<p>⏳ Loading sessions... (this may take a moment)</p>';
        
        try {
            // Get email from localStorage
            const userEmail = localStorage.getItem('mathQuizUserEmail');
            if (!userEmail) {
                historyList.innerHTML = '<p>❌ Error: User email not found. Please refresh and try again.</p>';
                console.error('User email not found in localStorage');
                return;
            }
            
            console.log('[DEBUG] Requesting sessions for:', userEmail);
            console.log('[DEBUG] Firebase db instance:', db);
            const sessions = await loadUserSessions(userEmail);
            console.log('[DEBUG] Received sessions:', sessions);
            
            if (sessions.length === 0) {
                historyList.innerHTML = '<p>No saved sessions yet. Answer some questions and save a session!</p>';
                return;
            }
            
            historyList.innerHTML = '';
            sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            
            sessions.forEach(session => {
                const sessionDate = new Date(session.startTime).toLocaleDateString();
                const sessionTime = new Date(session.startTime).toLocaleTimeString();
                const totalQuestions = session.questions.length;
                const correctAnswers = session.questions.filter(q => q.correct).length;
                const score = session.totalScore;
                
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-item-header">
                        <span>Grade ${session.grade} - ${session.section}</span>
                        <span>${sessionDate} ${sessionTime}</span>
                    </div>
                    <div class="history-item-details">
                        <p>Questions: ${correctAnswers}/${totalQuestions} correct</p>
                        <div class="history-item-score">Score: ${score} points</div>
                    </div>
                `;
                historyList.appendChild(historyItem);
            });
        } catch (error) {
            console.error('[ERROR] Failed to load sessions:', error);
            const errorMsg = error.message || 'Unknown error';
            historyList.innerHTML = `<p>❌ Error loading sessions:<br/>${errorMsg}<br/><small>Check browser console for details</small></p>`;
        }
    });

    // Close History Modal
    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.add('hidden');
        }
    });
});
