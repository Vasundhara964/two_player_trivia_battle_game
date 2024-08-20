document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('startGame');
    const selectCategoryBtn = document.getElementById('selectCategory');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const categoryList = document.getElementById('categoryList');
    const playerTurnText = document.getElementById('playerTurn');
    const questionText = document.getElementById('questionText');
    const optionButtons = [
        document.getElementById('optionA'),
        document.getElementById('optionB'),
        document.getElementById('optionC'),
        document.getElementById('optionD')
    ];
    const finalScore = document.getElementById('finalScore');

    let player1 = '';
    let player2 = '';
    let currentCategory = '';
    let currentQuestionIndex = 0;
    let questions = [];
    let scores = { player1: 0, player2: 0 };
    let turn = 'player1';
    const API_URL = 'https://opentdb.com/api.php';
    const difficulties = ['easy', 'medium', 'hard'];

    startGameBtn.addEventListener('click', startGame);
    selectCategoryBtn.addEventListener('click', selectCategory);
    optionButtons.forEach(button => {
        button.addEventListener('click', () => {
            checkAnswer(button.textContent);
        });
    });

    function startGame() {
        player1 = player1Input.value;
        player2 = player2Input.value;
        if (player1 && player2) {
            document.querySelector('.setup').style.display = 'none';
            document.querySelector('.categorySelection').style.display = 'block';
            fetchCategories();
        } else {
            alert('Player name missing');
        }
    }

    function fetchCategories() {
        const categories = [
            { id: 12, name: 'Music' },
            { id: 10, name: 'Books' },
            { id: 17, name: 'Science & Nature' },
            { id: 18, name: 'Computers' },
            { id: 19, name: 'Mathematics' },
            { id: 21, name: 'Sports' },
        ];

        categoryList.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryList.appendChild(option);
        });
    }

    function selectCategory() {
        currentCategory = categoryList.value;
        let fetchPromises = difficulties.map(difficulty =>
            fetch(`${API_URL}?amount=2&category=${currentCategory}&difficulty=${difficulty}`)
                .then(response => response.json())
                .then(data => data.results)
        );

        Promise.all(fetchPromises)
            .then(results => {
                questions = results.flat();
                document.querySelector('.categorySelection').style.display = 'none';
                document.querySelector('.questionSection').style.display = 'block';
                displayQuestion();
            })
            .catch(error => console.error('Error fetching questions:', error));
    }

    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            playerTurnText.textContent = `${turn === 'player1' ? player1 : player2}'s Turn (${currentQuestion.difficulty.toUpperCase()} question)`;
            questionText.innerHTML = currentQuestion.question;
            const answers = [currentQuestion.correct_answer, ...currentQuestion.incorrect_answers];
            answers.sort(() => Math.random() - 0.5);
            optionButtons.forEach((button, index) => {
                button.textContent = `${String.fromCharCode(65 + index)}. ${answers[index]}`;
            });
        } else {
            endGame();
        }
    }

    function checkAnswer(selectedAnswer) {
        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswer = currentQuestion.correct_answer;
        const difficulty = currentQuestion.difficulty;

        const selectedAnswerText = selectedAnswer.substring(3).trim(); // Adjust based on your option formatting

        if (selectedAnswerText === correctAnswer) {
            if (difficulty === 'easy') {
                scores[turn] += 10;
            } else if (difficulty === 'medium') {
                scores[turn] += 15;
            } else if (difficulty === 'hard') {
                scores[turn] += 20;
            }
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            turn = turn === 'player1' ? 'player2' : 'player1';
            displayQuestion();
        } else {
            endGame();
        }
    }

    function endGame() {
        document.querySelector('.questionSection').style.display = 'none';
        document.querySelector('.resultSection').style.display = 'block';

        const winner = scores.player1 > scores.player2 ? player1 : (scores.player1 < scores.player2 ? player2 : 'No one');
        finalScore.textContent = `${player1}: ${scores.player1} - ${player2}: ${scores.player2}. Winner: ${winner}`;
    }
});
