/* ============================================
   QUIZ STATE VARIABLES
   ============================================
   
   These variables keep track of the quiz status
*/

// Which question we're currently on (starts at 0)
let currentQuestion = 0;

// Total correct answers
let score = 0;

// Array to store user's answers for each question
// null means the question hasn't been answered yet
let answers = new Array(5).fill(null);

// Array to store fetched questions from the API
let quizData = [];

/* ============================================
   FUNCTION: startQuiz()
   ============================================
   
   Called when user clicks "Start Quiz" button
   This function:
   1. Gets selected difficulty and category
   2. Shows loading screen
   3. Fetches questions from Open Trivia Database API
   4. Displays error if fetch fails
*/

function startQuiz() {
    // Get user's selected difficulty (empty string = any difficulty)
    const difficulty = document.getElementById('difficulty').value;
    
    // Get user's selected category (empty string = random category)
    const category = document.getElementById('category').value;

    // Hide start screen
    document.getElementById('startScreen').classList.add('hidden');
    
    // Show loading screen
    document.getElementById('loadingScreen').classList.add('show');

    // Fetch questions from the API
    fetchQuestions(category, difficulty);
}

/* ============================================
   FUNCTION: fetchQuestions(category, difficulty)
   ============================================
   
   Fetches 5 quiz questions from Open Trivia Database API
   
   Parameters:
   - category: Category ID (empty string for random)
   - difficulty: 'easy', 'medium', 'hard' (empty for any)
   
   API Documentation: https://opentdb.com/api.php
*/

function fetchQuestions(category, difficulty) {
    // Build the API URL
    let apiUrl = 'https://opentdb.com/api.php?amount=5&type=multiple';
    
    // Add category if user selected one
    if (category) {
        apiUrl += `&category=${category}`;
    }
    
    // Add difficulty if user selected one
    if (difficulty) {
        apiUrl += `&difficulty=${difficulty}`;
    }

    // Use fetch to call the API
    fetch(apiUrl)
        .then(response => {
            // Check if response is OK (status 200)
            if (!response.ok) {
                throw new Error('API Error');
            }
            // Convert response to JSON
            return response.json();
        })
        .then(data => {
            // Check if API returned questions
            if (data.response_code !== 0) {
                throw new Error('No questions available for selected options');
            }
            
            // Format the API response to match our quiz structure
            formatQuestions(data.results);
            
            // Hide loading screen and show quiz
            showQuiz();
        })
        .catch(error => {
            // Handle error and show error screen
            showError(error.message);
        });
}

/* ============================================
   FUNCTION: formatQuestions(apiQuestions)
   ============================================
   
   Converts API response format to our quiz format
   
   API format:
   - question (HTML encoded)
   - correct_answer
   - incorrect_answers[]
   
   Our format:
   - question (plain text)
   - options[] (shuffled)
   - correct (index)
*/

function formatQuestions(apiQuestions) {
    // Clear previous questions
    quizData = [];
    
    // Reset answers array for new quiz
    answers = new Array(5).fill(null);

    // Loop through each question from the API
    apiQuestions.forEach(q => {
        // Decode HTML entities (e.g., &quot; becomes ")
        const decodedQuestion = decodeHTML(q.question);
        const decodedCorrect = decodeHTML(q.correct_answer);
        const decodedIncorrect = q.incorrect_answers.map(ans => decodeHTML(ans));

        // Combine correct and incorrect answers
        let allAnswers = [decodedCorrect, ...decodedIncorrect];
        
        // Shuffle the answers so correct answer isn't always in same position
        allAnswers = shuffleArray(allAnswers);

        // Find the index of correct answer after shuffling
        const correctIndex = allAnswers.indexOf(decodedCorrect);

        // Add formatted question to our array
        quizData.push({
            question: decodedQuestion,
            options: allAnswers,
            correct: correctIndex
        });
    });
}

/* ============================================
   FUNCTION: decodeHTML(html)
   ============================================
   
   The API returns HTML-encoded text (e.g., &quot; for quotes)
   This function converts them to regular characters
   
   Parameter:
   - html: HTML-encoded string
   
   Returns: Plain text string
*/

function decodeHTML(html) {
    // Create a temporary div element
    const txt = document.createElement('textarea');
    
    // Set its innerHTML to our HTML-encoded text
    txt.innerHTML = html;
    
    // Return the decoded text
    return txt.value;
}

/* ============================================
   FUNCTION: shuffleArray(array)
   ============================================
   
   Shuffles an array randomly using Fisher-Yates algorithm
   
   Parameter:
   - array: Array to shuffle
   
   Returns: Shuffled array
*/

function shuffleArray(array) {
    // Create a copy so we don't modify the original
    const shuffled = [...array];
    
    // Loop through array from end to beginning
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Pick a random index
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements at i and j
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

/* ============================================
   FUNCTION: showQuiz()
   ============================================
   
   Hides loading screen and shows the quiz
*/

function showQuiz() {
    // Hide loading screen
    document.getElementById('loadingScreen').classList.remove('show');
    
    // Show quiz screen
    document.getElementById('quizScreen').classList.remove('hidden');
    
    // Reset question counter to 0
    currentQuestion = 0;
    
    // Display first question
    displayQuestion();
}

/* ============================================
   FUNCTION: showError(errorMessage)
   ============================================
   
   Shows error screen when API call fails
   
   Parameter:
   - errorMessage: Error description to display
*/

function showError(errorMessage) {
    // Hide loading screen
    document.getElementById('loadingScreen').classList.remove('show');
    
    // Show error screen
    document.getElementById('errorScreen').classList.add('show');
    
    // Display error message
    document.getElementById('errorMessage').textContent = 
        `Error: ${errorMessage}. Please try again or select different options.`;
}

/* ============================================
   FUNCTION: goBackToStart()
   ============================================
   
   Hides error screen and returns to start screen
*/

function goBackToStart() {
    // Hide error screen
    document.getElementById('errorScreen').classList.remove('show');
    
    // Show start screen
    document.getElementById('startScreen').classList.remove('hidden');
}

/* ============================================
   FUNCTION: displayQuestion()
   ============================================
   
   Updates the screen to show the current question
   and all its answer options
*/

function displayQuestion() {
    // Get the current question object from quizData array
    const question = quizData[currentQuestion];
    
    // Calculate progress percentage (e.g., 20% for question 1 of 5)
    const progress = ((currentQuestion + 1) / quizData.length) * 100;

    // Update progress bar width
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update question number text (e.g., "Question 1 of 5")
    document.getElementById('questionNumber').textContent = 
        `Question ${currentQuestion + 1} of ${quizData.length}`;
    
    // Update question text
    document.getElementById('questionText').textContent = question.question;

    // Get the container where options will be placed
    const optionsContainer = document.getElementById('optionsContainer');
    
    // Clear any previous options
    optionsContainer.innerHTML = '';

    // Loop through each answer option and create a button for it
    question.options.forEach((option, index) => {
        // Create a new button element
        const button = document.createElement('button');
        
        // Add CSS class to style it as an option
        button.className = 'option';
        
        // Set button text to the option
        button.textContent = option;
        
        // Add click handler - when clicked, save this answer
        button.onclick = () => selectAnswer(index);

        // If this answer was already selected, highlight it
        if (answers[currentQuestion] === index) {
            button.classList.add('selected');
        }

        // Add button to the options container
        optionsContainer.appendChild(button);
    });

    // Update Previous/Next buttons status
    updateButtonStates();
}

/* ============================================
   FUNCTION: selectAnswer(index)
   ============================================
   
   Called when user clicks an answer option
   
   Parameters:
   - index: The position of the selected option (0-3)
*/

function selectAnswer(index) {
    // Save the user's answer in the answers array
    answers[currentQuestion] = index;
    
    // Refresh the display to show the selected answer highlighted
    displayQuestion();
}

/* ============================================
   FUNCTION: updateButtonStates()
   ============================================
   
   Updates the Previous/Next buttons based on
   which question we're on
*/

function updateButtonStates() {
    // Get reference to Previous button
    const prevBtn = document.getElementById('prevBtn');
    
    // Get reference to Next button
    const nextBtn = document.getElementById('nextBtn');

    // Disable Previous button if we're on the first question
    prevBtn.disabled = currentQuestion === 0;
    
    // Change Next button text to "Finish" on the last question
    nextBtn.textContent = currentQuestion === quizData.length - 1 ? 'Finish ✓' : 'Next →';
}

/* ============================================
   FUNCTION: nextQuestion()
   ============================================
   
   Called when user clicks Next button
   - Moves to next question if not on last question
   - Finishes quiz if on last question
*/

function nextQuestion() {
    // Check if we're not on the last question yet
    if (currentQuestion < quizData.length - 1) {
        // Move to next question
        currentQuestion++;
        
        // Display the new question
        displayQuestion();
    } else {
        // We're on the last question, so finish the quiz
        
        // Calculate final score
        calculateScore();
        
        // Show results screen
        showResults();
    }
}

/* ============================================
   FUNCTION: previousQuestion()
   ============================================
   
   Called when user clicks Previous button
   Moves to previous question (if not on first)
*/

function previousQuestion() {
    // Check if we're not on the first question
    if (currentQuestion > 0) {
        // Move to previous question
        currentQuestion--;
        
        // Display the previous question
        displayQuestion();
    }
}

/* ============================================
   FUNCTION: calculateScore()
   ============================================
   
   Compares user's answers with correct answers
   and calculates total score
*/

function calculateScore() {
    // Reset score to 0
    score = 0;
    
    // Loop through each question and check if answer is correct
    answers.forEach((answer, index) => {
        // If user's answer matches the correct answer, add 1 to score
        if (answer === quizData[index].correct) {
            score++;
        }
    });
}

/* ============================================
   FUNCTION: showResults()
   ============================================
   
   Shows the results screen with:
   - Final score
   - Percentage
   - Performance message
   - Performance color (based on score)
*/

function showResults() {
    // Hide quiz screen
    document.getElementById('quizScreen').classList.add('hidden');
    
    // Show results screen
    document.getElementById('resultsScreen').classList.add('show');

    // Calculate percentage (e.g., 80% for 4 out of 5)
    const percentage = Math.round((score / quizData.length) * 100);
    
    // Update score display (e.g., "4/5")
    document.getElementById('finalScore').textContent = `${score}/${quizData.length}`;
    
    // Update percentage text (e.g., "You scored 80%")
    document.getElementById('scoreText').textContent = `You scored ${percentage}%`;

    // Create performance message based on score
    let performance = '';
    let performanceClass = '';

    // Determine message and color based on percentage
    if (percentage === 100) {
        performance = 'Perfect! Outstanding! 🌟';
        performanceClass = 'excellent';
    } else if (percentage >= 80) {
        performance = 'Excellent! Great job! 🎯';
        performanceClass = 'excellent';
    } else if (percentage >= 60) {
        performance = 'Good work! Keep learning! 📚';
        performanceClass = 'good';
    } else if (percentage >= 40) {
        performance = 'Not bad! Practice more! 💪';
        performanceClass = 'average';
    } else {
        performance = 'Keep trying! You\'ll do better! 🚀';
        performanceClass = 'poor';
    }

    // Get the performance text element
    const performanceText = document.getElementById('performanceText');
    
    // Set the message
    performanceText.textContent = performance;
    
    // Apply the appropriate color class
    performanceText.className = 'performance ' + performanceClass;

    // Update the score display in the header
    updateScoreDisplay();
}

/* ============================================
   FUNCTION: updateScoreDisplay()
   ============================================
   
   Updates the score display in the header
   (e.g., "Score: 4/5")
*/

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = `Score: ${score}/${quizData.length}`;
}

/* ============================================
   FUNCTION: restartQuiz()
   ============================================
   
   Called when user clicks "Retake Quiz" button
   Resets all quiz data and returns to start screen
*/

function restartQuiz() {
    // Reset to first question
    currentQuestion = 0;
    
    // Reset score to 0
    score = 0;
    
    // Reset all answers (fill array with null values)
    answers = new Array(quizData.length).fill(null);
    
    // Clear quiz data
    quizData = [];

    // Hide results screen
    document.getElementById('resultsScreen').classList.remove('show');
    
    // Show start screen
    document.getElementById('startScreen').classList.remove('hidden');
    
    // Reset score display
    document.getElementById('scoreDisplay').textContent = 'Score: 0/0';
}

/* ============================================
   INITIALIZATION
   ============================================
   
   Run when page first loads
   Updates the score display to show initial state
*/

updateScoreDisplay();

/* ============================================
   FUNCTION: displayQuestion()
   ============================================
   
   Updates the screen to show the current question
   and all its answer options
*/

function displayQuestion() {
    // Get the current question object from quizData array
    const question = quizData[currentQuestion];
    
    // Calculate progress percentage (e.g., 20% for question 1 of 5)
    const progress = ((currentQuestion + 1) / quizData.length) * 100;

    // Update progress bar width
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update question number text (e.g., "Question 1 of 5")
    document.getElementById('questionNumber').textContent = 
        `Question ${currentQuestion + 1} of ${quizData.length}`;
    
    // Update question text
    document.getElementById('questionText').textContent = question.question;

    // Get the container where options will be placed
    const optionsContainer = document.getElementById('optionsContainer');
    
    // Clear any previous options
    optionsContainer.innerHTML = '';

    // Loop through each answer option and create a button for it
    question.options.forEach((option, index) => {
        // Create a new button element
        const button = document.createElement('button');
        
        // Add CSS class to style it as an option
        button.className = 'option';
        
        // Set button text to the option
        button.textContent = option;
        
        // Add click handler - when clicked, save this answer
        button.onclick = () => selectAnswer(index);

        // If this answer was already selected, highlight it
        if (answers[currentQuestion] === index) {
            button.classList.add('selected');
        }

        // Add button to the options container
        optionsContainer.appendChild(button);
    });

    // Update Previous/Next buttons status
    updateButtonStates();
}

/* ============================================
   FUNCTION: selectAnswer(index)
   ============================================
   
   Called when user clicks an answer option
   
   Parameters:
   - index: The position of the selected option (0-3)
*/

function selectAnswer(index) {
    // Save the user's answer in the answers array
    answers[currentQuestion] = index;
    
    // Refresh the display to show the selected answer highlighted
    displayQuestion();
}

/* ============================================
   FUNCTION: updateButtonStates()
   ============================================
   
   Updates the Previous/Next buttons based on
   which question we're on
*/

function updateButtonStates() {
    // Get reference to Previous button
    const prevBtn = document.getElementById('prevBtn');
    
    // Get reference to Next button
    const nextBtn = document.getElementById('nextBtn');

    // Disable Previous button if we're on the first question
    prevBtn.disabled = currentQuestion === 0;
    
    // Change Next button text to "Finish" on the last question
    nextBtn.textContent = currentQuestion === quizData.length - 1 ? 'Finish ✓' : 'Next →';
}

/* ============================================
   FUNCTION: nextQuestion()
   ============================================
   
   Called when user clicks Next button
   - Moves to next question if not on last question
   - Finishes quiz if on last question
*/

function nextQuestion() {
    // Check if we're not on the last question yet
    if (currentQuestion < quizData.length - 1) {
        // Move to next question
        currentQuestion++;
        
        // Display the new question
        displayQuestion();
    } else {
        // We're on the last question, so finish the quiz
        
        // Calculate final score
        calculateScore();
        
        // Show results screen
        showResults();
    }
}

/* ============================================
   FUNCTION: previousQuestion()
   ============================================
   
   Called when user clicks Previous button
   Moves to previous question (if not on first)
*/

function previousQuestion() {
    // Check if we're not on the first question
    if (currentQuestion > 0) {
        // Move to previous question
        currentQuestion--;
        
        // Display the previous question
        displayQuestion();
    }
}

/* ============================================
   FUNCTION: calculateScore()
   ============================================
   
   Compares user's answers with correct answers
   and calculates total score
*/

function calculateScore() {
    // Reset score to 0
    score = 0;
    
    // Loop through each question and check if answer is correct
    answers.forEach((answer, index) => {
        // If user's answer matches the correct answer, add 1 to score
        if (answer === quizData[index].correct) {
            score++;
        }
    });
}

/* ============================================
   FUNCTION: showResults()
   ============================================
   
   Shows the results screen with:
   - Final score
   - Percentage
   - Performance message
   - Performance color (based on score)
*/

function showResults() {
    // Hide quiz screen
    document.getElementById('quizScreen').classList.add('hidden');
    
    // Show results screen
    document.getElementById('resultsScreen').classList.add('show');

    // Calculate percentage (e.g., 80% for 4 out of 5)
    const percentage = Math.round((score / quizData.length) * 100);
    
    // Update score display (e.g., "4/5")
    document.getElementById('finalScore').textContent = `${score}/${quizData.length}`;
    
    // Update percentage text (e.g., "You scored 80%")
    document.getElementById('scoreText').textContent = `You scored ${percentage}%`;

    // Create performance message based on score
    let performance = '';
    let performanceClass = '';

    // Determine message and color based on percentage
    if (percentage === 100) {
        performance = 'Perfect! Outstanding! 🌟';
        performanceClass = 'excellent';
    } else if (percentage >= 80) {
        performance = 'Excellent! Great job! 🎯';
        performanceClass = 'excellent';
    } else if (percentage >= 60) {
        performance = 'Good work! Keep learning! 📚';
        performanceClass = 'good';
    } else if (percentage >= 40) {
        performance = 'Not bad! Practice more! 💪';
        performanceClass = 'average';
    } else {
        performance = 'Keep trying! You\'ll do better! 🚀';
        performanceClass = 'poor';
    }

    // Get the performance text element
    const performanceText = document.getElementById('performanceText');
    
    // Set the message
    performanceText.textContent = performance;
    
    // Apply the appropriate color class
    performanceText.className = 'performance ' + performanceClass;

    // Update the score display in the header
    updateScoreDisplay();
}

/* ============================================
   FUNCTION: updateScoreDisplay()
   ============================================
   
   Updates the score display in the header
   (e.g., "Score: 4/5")
*/

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = `Score: ${score}/${quizData.length}`;
}

/* ============================================
   FUNCTION: restartQuiz()
   ============================================
   
   Called when user clicks "Retake Quiz" button
   Resets all quiz data and returns to start screen
*/

function restartQuiz() {
    // Reset to first question
    currentQuestion = 0;
    
    // Reset score to 0
    score = 0;
    
    // Reset all answers (fill array with null values)
    answers = new Array(quizData.length).fill(null);

    // Hide results screen
    document.getElementById('resultsScreen').classList.remove('show');
    
    // Show start screen
    document.getElementById('startScreen').classList.remove('hidden');
    
    // Reset score display
    document.getElementById('scoreDisplay').textContent = 'Score: 0/0';
}

/* ============================================
   INITIALIZATION
   ============================================
   
   Run when page first loads
   Updates the score display to show initial state
*/

updateScoreDisplay();
