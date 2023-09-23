const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; // May need to change PORT to something else if 3000 is already in use

app.use(cors());

let score = 0;
let streak = 1;
let lives = 3;
let correctWord = '';

// Reset the score, streak, and lives
app.patch('/reset', (req, res) => {
    score = 0;
    streak = 1;
    lives = 3;
    res.status(200).send();
})

// Gets word from API and scrambles it
app.get('/getWord', async (req, res) => {

    const random = Math.random();

    // Make the random number be between 4 and 7
    const randomNumber = random * (6 - 4) + 4;

    // Use Math.floor to round down to the nearest integer
    let wordLength = Math.floor(randomNumber);

    if (req.query.hardmode === "true") {
        wordLength += 5;
    }

    // Get a random word from the API
    let word = await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}`).then(res => res.json());


    word = word[0];    // Make word variable a string
    correctWord = word;     // Save correct word
    const charArray = word.split('');     // Convert the string to an array of characters
        
    // Shuffle the array using the Fisher-Yates shuffle algorithm
    for (let i = charArray.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
    }
    // With low length words, the algo has a chance to not shuffle the word so we double it
    for (let i = charArray.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
    }
        
    // Join the shuffled characters back into a string
    const scrambledWord = charArray.join('');
    console.log(correctWord);
    res.status(200).send(scrambledWord);
})

app.patch('/guessWord', (req, res) => {
    let guessWord = req.query.guess;
    guessWord = guessWord.toLowerCase();
     if (guessWord === correctWord) {
        score += 1000 * streak;
        streak += 1;
        lives = 3;
        res.status(200).send({ correct: true, score: score, lives: lives });
    } else {
        streak = 1;
        lives -= 1;
        if (score === 0) { // If the player has no score, don't let them lose lives
            lives = 3;
            res.status(200).send({ correct: false, score: score, lives: lives });
        } else if (lives === 0) { // If the player loses all lives, reset the score
            score = 0;
            res.status(200).send({ gameOver: true, score: score, lives: lives });
        } else { // If the player has lives left, don't reset the score
            res.status(200).send({ correct: false, score: score, lives: lives });
        }
}
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});