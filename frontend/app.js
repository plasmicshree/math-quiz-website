document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const answerFields = document.getElementById('answer-fields');
    let answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultDiv = document.getElementById('result');
    const sectionSelect = document.getElementById('section-select');
    const gradeSelect = document.getElementById('grade-select');
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

    const savedGrade = localStorage.getItem('mathQuizGrade');
    if (savedGrade) {
        gradeSelect.value = savedGrade;
        currentGrade = parseInt(savedGrade);
        enableApp();
    }

    gradeSelect.addEventListener('change', (e) => {
        const grade = e.target.value;
        if (grade) {
            currentGrade = parseInt(grade);
            localStorage.setItem('mathQuizGrade', grade);
            enableApp();
            updateAvailableSections();
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
        document.querySelectorAll('.disabled-overlay').forEach(el => {
            el.classList.add('enabled');
        });
        sectionSelect.disabled = false;
        submitBtn.disabled = false;
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
        if (!currentGrade) {
            return;
        }
        fetch(`http://127.0.0.1:5000/api/question?section=${section}&grade=${currentGrade}`)
            .then(res => res.json())
            .then(data => {
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
});
