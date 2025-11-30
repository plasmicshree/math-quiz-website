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

// Determine API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000/api'
  : 'https://math-quiz-website-ksfl.onrender.com/api';

console.log('🌍 Environment:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'LOCAL' : 'PRODUCTION');
console.log('📡 API Base URL:', API_BASE_URL);

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

    /**
     * ============================================================
     * SHARED SVG BLOCK RENDERING UTILITIES
     * ============================================================
     * Used by multiple grades for block-based visualization
     * Supports configurable sections per block (5, 10, etc.)
     */
    
    /**
     * Render blocks for a single number with configurable sections per block
     * @param {Object} numberVisual - {full_blocks, remainder, total}
     * @param {String} color - Color code (e.g., '#4CAF50')
     * @param {Number} sectionsPerBlock - Sections in each block (5 or 10)
     * @returns {String} SVG as HTML string
     */
    function renderBlocksForNumber(numberVisual, color, sectionsPerBlock = 5) {
        try {
            const blockWidth = 30;
            const sectionHeight = 100 / sectionsPerBlock; // Dynamic height based on section count
            const blockHeight = 100;
            const gap = 10;
            const numBlocks = numberVisual.full_blocks + (numberVisual.remainder > 0 ? 1 : 0);
            const svgWidth = Math.max(50, numBlocks * (blockWidth + gap) + 10);
            
            let svg = `<svg width="${svgWidth}" height="120" viewBox="0 0 ${svgWidth} 120" xmlns="http://www.w3.org/2000/svg" style="margin: 10px auto; display: block;">`;
            
            // Full blocks
            for (let b = 0; b < numberVisual.full_blocks; b++) {
                const x = b * (blockWidth + gap) + 5;
                svg += `<g><rect x="${x}" y="0" width="${blockWidth}" height="${blockHeight}" fill="none" stroke="#333" stroke-width="2"/>`;
                for (let s = 0; s < sectionsPerBlock; s++) {
                    const sy = s * sectionHeight;
                    svg += `<rect x="${x}" y="${sy}" width="${blockWidth}" height="${sectionHeight}" fill="${color}" stroke="#333" stroke-width="1"/>`;
                }
                svg += `</g>`;
            }
            
            // Partial block if needed
            if (numberVisual.remainder > 0) {
                const x = numberVisual.full_blocks * (blockWidth + gap) + 5;
                svg += `<g><rect x="${x}" y="0" width="${blockWidth}" height="${blockHeight}" fill="none" stroke="#333" stroke-width="2"/>`;
                for (let s = 0; s < sectionsPerBlock; s++) {
                    const sy = s * sectionHeight;
                    const fillColor = s < numberVisual.remainder ? color : '#e8e8e8';
                    svg += `<rect x="${x}" y="${sy}" width="${blockWidth}" height="${sectionHeight}" fill="${fillColor}" stroke="#333" stroke-width="1"/>`;
                }
                svg += `</g>`;
            }
            
            svg += '</svg>';
            return svg;
        } catch (error) {
            console.error('[SVG-BLOCKS] Error:', error);
            return '<svg><text x="10" y="20" fill="red">Error rendering blocks</text></svg>';
        }
    }
    
    /**
     * Render solution blocks showing combined result with color distribution
     * @param {Object} visual - {first, second, result} each with {full_blocks, remainder, total}
     * @param {Number} firstNum - Value for first number
     * @param {Number} secondNum - Value for second number
     * @param {String} firstColor - Color for first number sections (e.g., '#4CAF50')
     * @param {String} secondColor - Color for second number sections (e.g., '#2196F3')
     * @param {Number} sectionsPerBlock - Sections in each block (5 or 10)
     * @returns {String} SVG as HTML string
     */
    function renderSolutionBlocks(visual, firstNum, secondNum, firstColor, secondColor, sectionsPerBlock = 5) {
        const blockWidth = 30;
        const sectionHeight = 100 / sectionsPerBlock; // Dynamic height based on section count
        const blockHeight = 100;
        const gap = 10;
        const totalNum = visual.result.total;
        const numBlocks = Math.ceil(totalNum / sectionsPerBlock);
        const svgWidth = Math.max(80, numBlocks * (blockWidth + gap) + 10);
        
        let svg = `<svg width="${svgWidth}" height="120" viewBox="0 0 ${svgWidth} 120" style="margin: 10px auto; display: block;">`;
        
        let sectionIndex = 0;
        
        for (let b = 0; b < numBlocks; b++) {
            const x = b * (blockWidth + gap) + 5;
            svg += `<g><rect x="${x}" y="0" width="${blockWidth}" height="${blockHeight}" fill="none" stroke="#333" stroke-width="2"/>`;
            
            for (let s = 0; s < sectionsPerBlock; s++) {
                const sy = s * sectionHeight;
                let fillColor = '#e8e8e8';
                
                if (sectionIndex < firstNum) {
                    fillColor = firstColor; // Color for first number
                } else if (sectionIndex < totalNum) {
                    fillColor = secondColor; // Color for second number
                }
                
                svg += `<rect x="${x}" y="${sy}" width="${blockWidth}" height="${sectionHeight}" fill="${fillColor}" stroke="#333" stroke-width="1"/>`;
                sectionIndex++;
            }
            svg += `</g>`;
        }
        
        svg += '</svg>';
        return svg;
    }

    /**
     * Utility: Reveal addition solution blocks for current grade
     * Works for Grade 1, Grade 2, and any future grades using addition-solution-hidden
     * @param {Number} grade - Current grade level
     * @param {String} section - Current section
     */
    function revealAdditionSolution(grade, section) {
        if (section === 'addition' && [1, 2].includes(grade)) {
            const solutionDiv = document.getElementById('addition-solution-hidden');
            if (solutionDiv) {
                solutionDiv.style.display = 'block';
                console.log(`[SOLUTION] Revealed for Grade ${grade} Addition`);
            }
        }
    }
    
    /**
     * Utility: Reveal subtraction solution blocks for current grade
     * Works for Grade 2 (and future grades) using subtraction-solution-hidden
     * @param {Number} grade - Current grade level
     * @param {String} section - Current section
     */
    function revealSubtractionSolution(grade, section) {
        if (section === 'subtraction' && [2].includes(grade)) {
            const solutionDiv = document.getElementById('subtraction-solution-hidden');
            if (solutionDiv) {
                solutionDiv.style.display = 'block';
                console.log(`[SOLUTION] Revealed for Grade ${grade} Subtraction`);
            }
        }
    }

    /**
     * ============================================================
     * GRADE-SPECIFIC RENDERING FUNCTIONS
     * ============================================================
     */
    
    /**
     * Renders Grade 1 Addition visualization with blocks (5 sections per block)
     * Completely isolated from fractions visualization
     */
    function renderGrade1Addition(data, chartContainer) {
        try {
            console.log('[GRADE1-ADD] Rendering with data:', data);
            
            if (!data.visual || !data.first_number || !data.second_number || !data.answer) {
                console.error('[GRADE1-ADD] Missing required fields:', {
                    hasVisual: !!data.visual,
                    hasFirstNumber: !!data.first_number,
                    hasSecondNumber: !!data.second_number,
                    hasAnswer: !!data.answer
                });
                return false;
            }
            
            const visual = data.visual;
            let html = '';
            
            // PROBLEM DISPLAY: First Number + Second Number
            html += '<div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; padding:20px; background:#f9f9f9; border-radius:8px; margin-bottom:20px;">';
            
            // First number blocks (GREEN)
            html += '<div style="text-align:center;">';
            html += renderBlocksForNumber(visual.first, '#4CAF50', 5); // Grade 1: 5 sections
            html += `<div style="font-weight:bold; margin-top:8px; font-size:1.2rem;">${data.first_number}</div>`;
            html += '</div>';
            
            // Plus sign
            html += '<div style="font-size:36px; font-weight:bold; display:flex; align-items:center;">+</div>';
            
            // Second number blocks (BLUE)
            html += '<div style="text-align:center;">';
            html += renderBlocksForNumber(visual.second, '#2196F3', 5); // Grade 1: 5 sections
            html += `<div style="font-weight:bold; margin-top:8px; font-size:1.2rem;">${data.second_number}</div>`;
            html += '</div>';
            
            html += '</div>';
            
            // SOLUTION DISPLAY (Hidden initially)
            html += '<div id="addition-solution-hidden" style="display:none; padding:20px; background:#f0f8ff; border-radius:8px; border-left:4px solid #2196F3;">';
            html += '<div style="font-weight:bold; margin-bottom:12px; font-size:1.05rem;">✓ Solution:</div>';
            html += '<div style="text-align:center;">';
            html += renderSolutionBlocks(visual, data.first_number, data.second_number, '#4CAF50', '#2196F3', 5); // Grade 1: 5 sections
            html += `<div style="font-weight:bold; margin-top:12px; font-size:1.1rem;">${data.first_number} + ${data.second_number} = ${data.answer}</div>`;
            html += '</div>';
            html += '</div>';
            
            chartContainer.innerHTML = html;
            console.log('[GRADE1-ADD] innerHTML set successfully, HTML length:', html.length);
            chartContainer.style.display = 'block';
            chartContainer.style.visibility = 'visible';
            chartContainer.style.opacity = '1';
            console.log('[GRADE1-ADD] display set to block, visibility to visible');
            console.log('[GRADE1-ADD] ✓ Visualization rendered successfully');
            return true;
        } catch (error) {
            console.error('[GRADE1-ADD] Error rendering visualization:', error);
            chartContainer.innerHTML = `<div style="color:red; padding:20px;"><strong>Error:</strong> ${error.message}</div>`;
            return false;
        }
    }
    
    /**
     * Renders Grade 2 Addition visualization with blocks (10 sections per block)
     */
    function renderGrade2Addition(data, chartContainer) {
        try {
            console.log('[GRADE2-ADD] Rendering with data:', data);
            
            if (!data.visual || !data.first_number || !data.second_number || !data.answer) {
                console.error('[GRADE2-ADD] Missing required fields:', {
                    hasVisual: !!data.visual,
                    hasFirstNumber: !!data.first_number,
                    hasSecondNumber: !!data.second_number,
                    hasAnswer: !!data.answer,
                    allData: data
                });
                return false;
            }
            
            // Validate visual structure
            if (!data.visual.first || !data.visual.second || !data.visual.result) {
                console.error('[GRADE2-ADD] Invalid visual structure:', data.visual);
                return false;
            }
            
            const visual = data.visual;
            let html = '';
            
            // PROBLEM DISPLAY: First Number + Second Number
            html += '<div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; padding:20px; background:#f9f9f9; border-radius:8px; margin-bottom:20px;">';
            
            // First number blocks (GREEN)
            html += '<div style="text-align:center;">';
            const firstBlocksSvg = renderBlocksForNumber(visual.first, '#4CAF50', 10); // Grade 2: 10 sections
            console.log('[GRADE2-ADD] First blocks SVG length:', firstBlocksSvg.length);
            html += firstBlocksSvg;
            html += `<div style="font-weight:bold; margin-top:8px; font-size:1.2rem;">${data.first_number}</div>`;
            html += '</div>';
            
            // Plus sign
            html += '<div style="font-size:36px; font-weight:bold; display:flex; align-items:center;">+</div>';
            
            // Second number blocks (BLUE)
            html += '<div style="text-align:center;">';
            const secondBlocksSvg = renderBlocksForNumber(visual.second, '#2196F3', 10); // Grade 2: 10 sections
            console.log('[GRADE2-ADD] Second blocks SVG length:', secondBlocksSvg.length);
            html += secondBlocksSvg;
            html += `<div style="font-weight:bold; margin-top:8px; font-size:1.2rem;">${data.second_number}</div>`;
            html += '</div>';
            
            html += '</div>';
            
            // SOLUTION DISPLAY (Hidden initially)
            html += '<div id="addition-solution-hidden" style="display:none; padding:20px; background:#f0f8ff; border-radius:8px; border-left:4px solid #2196F3;">';
            html += '<div style="font-weight:bold; margin-bottom:12px; font-size:1.05rem;">✓ Solution:</div>';
            html += '<div style="text-align:center;">';
            const solutionSvg = renderSolutionBlocks(visual, data.first_number, data.second_number, '#4CAF50', '#2196F3', 10); // Grade 2: 10 sections
            console.log('[GRADE2-ADD] Solution SVG length:', solutionSvg.length);
            html += solutionSvg;
            html += `<div style="font-weight:bold; margin-top:12px; font-size:1.1rem;">${data.first_number} + ${data.second_number} = ${data.answer}</div>`;
            html += '</div>';
            html += '</div>';
            
            chartContainer.innerHTML = html;
            console.log('[GRADE2-ADD] innerHTML set successfully, HTML length:', html.length);
            chartContainer.style.display = 'block';
            chartContainer.style.visibility = 'visible';
            chartContainer.style.opacity = '1';
            console.log('[GRADE2-ADD] display set to block, visibility to visible');
            console.log('[GRADE2-ADD] ✓ Visualization rendered successfully');
            return true;
        } catch (error) {
            console.error('[GRADE2-ADD] Error rendering visualization:', error);
            console.error('[GRADE2-ADD] Error stack:', error.stack);
            chartContainer.innerHTML = `<div style="color:red; padding:20px;"><strong>Error:</strong> ${error.message}</div>`;
            return false;
        }
    }

    /**
     * ============================================================
     * SUBTRACTION RENDERING FUNCTIONS
     * ============================================================
     * "Take Away" visualization: Shows starting amount, subtract amount, result
     */
    
    /**
     * Renders subtraction visualization with "take away" concept
     * Problem: Shows Start with (green blocks) and Take away (red blocks) separately
     * Solution: Shows overlaid visualization so student can see which sections were removed
     * @param {Object} data - Question data with visual, minuend, subtrahend
     * @param {HTMLElement} chartContainer - Container to render into
     * @param {Number} sectionsPerBlock - Sections in each block (5, 10, etc.)
     * @returns {Boolean} Success status
     */
    function renderSubtractionVisualization(data, chartContainer, sectionsPerBlock = 5) {
        try {
            console.log('[SUBTRACTION-VIZ] Rendering with data:', data);
            
            if (!data.visual || !data.minuend || !data.subtrahend) {
                console.error('[SUBTRACTION-VIZ] Missing required fields');
                return false;
            }
            
            const visual = data.visual;
            let html = '';
            
            // PROBLEM DISPLAY: Separate Start with and Take away visualizations
            html += '<div style="padding:20px; background:#f9f9f9; border-radius:8px; margin-bottom:20px;">';
            
            // Instructions
            html += '<div style="text-align:center; margin-bottom:20px; font-size:0.95rem; color:#666;">';
            html += '<strong style="display:block; margin-bottom:8px;">Count the GREEN sections only:</strong>';
            html += '<span style="font-size:1.1rem; font-weight:bold;">' + data.minuend + ' − ' + data.subtrahend + ' = ?</span>';
            html += '</div>';
            
            // Visualization: Start with (GREEN) and Take away (RED) - SEPARATE, NO OVERLAP
            html += '<div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:30px; margin:30px 0;">';
            
            // START WITH: Full green blocks
            html += '<div style="text-align:center;">';
            html += '<div style="font-size:0.9rem; color:#666; font-weight:600; margin-bottom:12px;">Start with:</div>';
            html += renderBlocksForNumber(visual.total, '#4CAF50', sectionsPerBlock);
            html += '<div style="font-weight:bold; margin-top:8px; font-size:1.1rem;">' + data.minuend + '</div>';
            html += '</div>';
            
            // Minus sign
            html += '<div style="font-size:32px; font-weight:bold; display:flex; align-items:center; color:#666;">−</div>';
            
            // TAKE AWAY: Red blocks showing only what to subtract
            html += '<div style="text-align:center;">';
            html += '<div style="font-size:0.9rem; color:#666; font-weight:600; margin-bottom:12px;">Take away:</div>';
            html += renderBlocksForNumber(visual.subtract, '#FF6B6B', sectionsPerBlock);
            html += '<div style="font-weight:bold; margin-top:8px; font-size:1.1rem;">' + data.subtrahend + '</div>';
            html += '</div>';
            
            html += '</div>';
            
            // Student prompt
            html += '<div style="text-align:center; margin-top:20px; padding:16px; background:#e8f5e9; border-radius:8px; border-left:4px solid #4CAF50;">';
            html += '<div style="font-size:0.95rem; color:#2E7D32;"><strong>👉 How many GREEN sections are left?</strong></div>';
            html += '</div>';
            
            html += '</div>';
            
            // SOLUTION DISPLAY (Hidden initially) - Shows overlaid visualization
            html += '<div id="subtraction-solution-hidden" style="display:none; padding:20px; background:#fff3e0; border-radius:8px; border-left:4px solid #FF9800; margin-top:20px;">';
            html += '<div style="font-weight:bold; margin-bottom:16px; font-size:1.05rem;">✓ Solution:</div>';
            html += '<div style="text-align:center; font-size:0.95rem;">';
            
            // Show overlaid visualization in solution
            html += '<div style="margin-bottom:16px;">';
            html += '<div style="font-size:0.9rem; color:#666; font-weight:600; margin-bottom:12px;">Here\'s what it looks like when we remove the red sections:</div>';
            
            // Render the overlaid version in solution
            const blockWidth = 30;
            const numBlocks = visual.total.full_blocks + (visual.total.remainder > 0 ? 1 : 0);
            const gap = 10;
            const svgWidth = Math.max(50, numBlocks * (blockWidth + gap) + 10);
            const sectionHeight = 100 / sectionsPerBlock;
            const blockHeight = 100;
            
            let overlayHtml = '<svg width="' + svgWidth + '" height="120" viewBox="0 0 ' + svgWidth + ' 120" style="position:relative; margin: 10px auto; display: block;">';
            
            // Draw all sections first - only up to minuend total, but show full blocks with grey padding
            let sectionIndex = 0;
            let totalSectionsToShow = data.minuend; // Only show sections up to minuend (Start with amount)
            
            for (let b = 0; b < numBlocks; b++) {
                const x = b * (blockWidth + gap) + 5;
                overlayHtml += '<g><rect x="' + x + '" y="0" width="' + blockWidth + '" height="' + blockHeight + '" fill="none" stroke="#333" stroke-width="2"/>';
                
                for (let s = 0; s < sectionsPerBlock; s++) {
                    const sy = s * sectionHeight;
                    let fillColor = '#e8e8e8'; // Grey by default (for unused sections)
                    
                    // Only draw sections up to minuend
                    if (sectionIndex < totalSectionsToShow) {
                        // Color sections that are being subtracted
                        if (sectionIndex < data.subtrahend) {
                            fillColor = '#FF6B6B'; // Red for subtracted
                        } else {
                            fillColor = '#4CAF50'; // Green for remaining
                        }
                    }
                    
                    overlayHtml += '<rect x="' + x + '" y="' + sy + '" width="' + blockWidth + '" height="' + sectionHeight + '" fill="' + fillColor + '" stroke="#333" stroke-width="1"/>';
                    
                    sectionIndex++;
                }
                overlayHtml += '</g>';
            }
            
            // Add cross pattern to red sections
            overlayHtml += '<defs>';
            overlayHtml += '<pattern id="cross-solution" patternUnits="userSpaceOnUse" width="8" height="8">';
            overlayHtml += '<line x1="0" y1="0" x2="8" y2="8" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>';
            overlayHtml += '<line x1="8" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>';
            overlayHtml += '</pattern>';
            overlayHtml += '</defs>';
            
            // Apply crosses to red sections
            sectionIndex = 0;
            for (let b = 0; b < numBlocks; b++) {
                const x = b * (blockWidth + gap) + 5;
                for (let s = 0; s < sectionsPerBlock; s++) {
                    const sy = s * sectionHeight;
                    if (sectionIndex < data.subtrahend) {
                        overlayHtml += '<rect x="' + x + '" y="' + sy + '" width="' + blockWidth + '" height="' + sectionHeight + '" fill="url(#cross-solution)" opacity="0.8" rx="1"/>';
                    }
                    sectionIndex++;
                }
            }
            
            overlayHtml += '</svg>';
            
            html += overlayHtml;
            html += '</div>';
            
            html += '<div style="margin-top:12px; font-size:0.9rem;">';
            html += '<div style="margin-bottom:8px;">Started with: <strong>' + data.minuend + '</strong> sections</div>';
            html += '<div style="margin-bottom:8px;">Removed: <strong>' + data.subtrahend + '</strong> sections (red with ✕)</div>';
            html += '<div style="margin-bottom:8px;">Remaining: <strong>' + data.answer + '</strong> GREEN sections</div>';
            html += '</div>';
            
            html += '<div style="font-size:1.2rem; font-weight:bold; margin-top:12px; color:#2E7D32;">Answer: ' + data.minuend + ' − ' + data.subtrahend + ' = ' + data.answer + '</div>';
            html += '</div>';
            html += '</div>';
            
            chartContainer.innerHTML = html;
            chartContainer.style.display = 'block';
            chartContainer.style.visibility = 'visible';
            chartContainer.style.opacity = '1';
            console.log('[SUBTRACTION-VIZ] ✓ Visualization rendered successfully with separate problem and overlaid solution');
            return true;
        } catch (error) {
            console.error('[SUBTRACTION-VIZ] Error rendering visualization:', error);
            chartContainer.innerHTML = '<div style="color:red; padding:20px;"><strong>Error:</strong> ' + error.message + '</div>';
            return false;
        }
    }
    
    /**
     * Renders Grade 2 Subtraction visualization with 10-section blocks
     */
    function renderGrade2Subtraction(data, chartContainer) {
        return renderSubtractionVisualization(data, chartContainer, 10); // Grade 2: 10 sections
    }

    function loadQuestion(section) {
        console.log('[QUESTION] Loading question for section:', section, 'grade:', currentGrade);
        
        if (!currentGrade) {
            console.error('[QUESTION] No grade selected');
            questionText.textContent = 'Please select a grade to begin.';
            return;
        }
        
        const apiUrl = API_BASE_URL + '/question?section=' + section + '&grade=' + currentGrade;
        console.log('[QUESTION] Fetching from:', apiUrl);
        
        fetch(apiUrl)
            .then(res => {
                console.log('[QUESTION] Response status:', res.status);
                if (!res.ok) {
                    throw new Error('HTTP ' + res.status + ': ' + res.statusText);
                }
                return res.json();
            })
            .then(data => {
                console.log('[QUESTION] ✓ Received question');
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
                
                // AGGRESSIVE cleanup: Clear everything from chart container
                chartContainer.innerHTML = '';
                chartContainer.textContent = '';
                chartContainer.style.display = 'none';
                chartContainer.style.visibility = 'hidden';
                chartContainer.style.opacity = '0';
                
                // Also explicitly hide any stray solution divs
                const allSolutionDivs = document.querySelectorAll('[id*="addition-solution"]');
                allSolutionDivs.forEach(div => {
                    div.style.display = 'none';
                    div.style.visibility = 'hidden';
                    div.remove();
                });
                
                // Grade 1 and Grade 2 Addition with block visualization
                if (currentGrade === 1 && section === 'addition') {
                    console.log('[GRADE1] Rendering Grade 1 Addition visualization');
                    const success = renderGrade1Addition(data, chartContainer);
                    if (!success) {
                        console.error('[GRADE1] Failed to render visualization');
                        return;
                    }
                    answerFields.innerHTML = `<input type="number" id="answer-input" placeholder="Your answer"><span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>`;
                } else if (currentGrade === 2 && section === 'addition') {
                    console.log('[GRADE2] Rendering Grade 2 Addition visualization');
                    const success = renderGrade2Addition(data, chartContainer);
                    if (!success) {
                        console.error('[GRADE2] Failed to render visualization');
                        return;
                    }
                    answerFields.innerHTML = `<input type="number" id="answer-input" placeholder="Your answer"><span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>`;
                } else if (currentGrade === 2 && section === 'subtraction') {
                    console.log('[GRADE2-SUB] Rendering Grade 2 Subtraction visualization');
                    const success = renderGrade2Subtraction(data, chartContainer);
                    if (!success) {
                        console.error('[GRADE2-SUB] Failed to render visualization');
                        return;
                    }
                    answerFields.innerHTML = `<input type="number" id="answer-input" placeholder="Your answer"><span id="admin-answer-display" style="margin-left:12px;color:#666;font-size:0.9rem;"></span>`;
                } else if (section === 'division') {
                    // Create division explanation panel
                    let divisionHtml = '<div style="padding:16px;font-size:0.95rem;line-height:1.6;">';
                    divisionHtml += '<div style="font-weight:600;font-size:1.1rem;margin-bottom:12px;">📚 Understanding Division</div>';
                    
                    divisionHtml += '<div style="margin-bottom:16px;">';
                    divisionHtml += '<div style="margin-bottom:8px;"><strong>What is Division?</strong></div>';
                    divisionHtml += '<div style="margin-bottom:12px;">Division is sharing or grouping items equally. We divide a larger number (dividend) into groups based on another number (divisor).</div>';
                    divisionHtml += '</div>';
                    
                    divisionHtml += '<div style="background:#f0f4ff;padding:12px;border-radius:4px;margin-bottom:16px;border-left:4px solid #2196F3;">';
                    divisionHtml += '<div style="margin-bottom:8px;"><strong>Key Terms:</strong></div>';
                    divisionHtml += '<ul style="margin:0;padding-left:20px;">';
                    divisionHtml += '<li><strong>Dividend:</strong> The number being divided (shared)</li>';
                    divisionHtml += '<li><strong>Divisor:</strong> How many groups or items per group</li>';
                    divisionHtml += '<li><strong>Quotient:</strong> The answer - how many in each group</li>';
                    divisionHtml += '<li><strong>Remainder:</strong> What\'s left over after equal sharing</li>';
                    divisionHtml += '</ul>';
                    divisionHtml += '</div>';
                    
                    divisionHtml += '<div><strong>Example:</strong> 17 ÷ 5</div>';
                    divisionHtml += '<ul style="margin:8px 0;padding-left:20px;">';
                    divisionHtml += '<li>17 cookies (dividend)</li>';
                    divisionHtml += '<li>Share among 5 friends (divisor)</li>';
                    divisionHtml += '<li>Each friend gets 3 cookies (quotient)</li>';
                    divisionHtml += '<li>2 cookies left over (remainder)</li>';
                    divisionHtml += '</ul>';
                    divisionHtml += '<div style="margin-top:8px;font-weight:600;">17 ÷ 5 = 3 remainder 2</div>';
                    divisionHtml += '</div>';
                    
                    chartContainer.innerHTML = divisionHtml;
                    chartContainer.style.display = 'block';
                    
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
                    fetch(API_BASE_URL + '/get_answer', {
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
        console.log('[SECTION-CHANGE] User switched from', currentSection, 'to', e.target.value);
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
        fetch(API_BASE_URL + '/answer', {
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
                
                // Show solution visualization (Grade 1, 2, and future grades)
                if (currentSection === 'addition') {
                    revealAdditionSolution(currentGrade, currentSection);
                } else if (currentSection === 'subtraction') {
                    revealSubtractionSolution(currentGrade, currentSection);
                }
                
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
                    
                    // Show solution visualization (Grade 1, 2, and future grades)
                    if (currentSection === 'addition') {
                        revealAdditionSolution(currentGrade, currentSection);
                    } else if (currentSection === 'subtraction') {
                        revealSubtractionSolution(currentGrade, currentSection);
                    }
                    
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
                const maxPossibleScore = totalQuestions * 10; // 10 points per question maximum
                
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-item-header">
                        <span>Grade ${session.grade} - ${session.section}</span>
                        <span>${sessionDate} ${sessionTime}</span>
                    </div>
                    <div class="history-item-details">
                        <p>Questions: ${correctAnswers}/${totalQuestions} correct</p>
                        <div class="history-item-score">Score: ${score}/${maxPossibleScore} points</div>
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
