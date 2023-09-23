import { useState, useEffect } from 'react';
import { PiEggBold, PiEggCrackBold } from 'react-icons/Pi';
import { Input, Button, notification } from 'antd';
import axios from 'axios';
import "./Game.css"

function Game () {

    const [word, setWord] = useState("");
    const [score, setScore] = useState(0);
    const [guess, setGuess] = useState("");
    const [lives, setLives] = useState([true,true,true]);
    const [numLives, setNumLives] = useState(3);
    const [hardMode, setHardMode] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Gets scrambled from backend
    useEffect(() => { 
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `http://localhost:3000/getWord?hardmode=${hardMode}`,
                headers: { }
              };
              
              axios.request(config)
                .then((response) => {
                    setWord(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
    },[hardMode, score]);

    // Sync numLives with lives
    useEffect(() => {
        const newLives = [];
        for (let i = 0; i < numLives; i++) {
            newLives.push(true);
        }
        for (let i = 0; i < 3 - numLives; i++) {
            newLives.push(false);
        }
        setLives(newLives);
    },[numLives]);

    // Reset score and lives and guess
    useEffect(() => {
        axios.request('http://localhost:3000/reset',{
            method: 'patch',
        });

        setGuess("");
        setNumLives(3);
        setScore(0);
    },[gameOver, hardMode])   

    // Submit button handler
    const handleSubmit = () => {
        let config = {
        method: 'patch',
        maxBodyLength: Infinity,
        url: `http://localhost:3000/guessWord?guess=${guess}`,
        headers: { }
        };
        
        axios.request(config)
            .then((response) => {
                if(response.data.correct === true) {
                    setScore(response.data.score);
                    notification.success({
                        message: "Correct!",
                        description: "You guessed the word correctly!",
                        placement: "bottomRight",
                        duration: 2
                    });
                } else if (score === 0 && response.data.correct === false) { // If first guess is wrong
                    notification.error({
                        message: "Incorrect!",
                        description: "Since it's your first word, try again!",
                        placement: "bottomRight",
                        duration: 2
                    });
                } else if (!response.data.gameOver) { // Incorrect guess
                    notification.error({
                        message: "Incorrect!",
                        description: "You guessed the word incorrectly!",
                        placement: "bottomRight",
                        duration: 2
                    });
                } else {
                    notification.error({ // Game over
                        message: "YOU LOSE!",
                        description: "YOU LOSE",
                        placement: "bottomRight",
                        duration: 4
                    });
                    setGameOver(!gameOver);
                }
                setNumLives(response.data.lives);
                setGuess("");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleModeSwitch = () => {
        setHardMode(!hardMode);
    }

    return (
        <div className="card game-container">
            <p>Lives:</p>
            {lives.map((alive,i) => {
                if (alive) { // Changes life icons
                    return <PiEggBold className="egg" key={i}/>
                } else {
                    return <PiEggCrackBold className="egg" key={i} />
                }
            })}
            <h2> Current Word: {word} </h2>
            <Input size="large" placeholder="Enter your guess"
                onChange={(input) => {setGuess(input.target.value); }}
                value={guess} />
            <br /> <br />
            <Button type="primary" size="large" onClick={handleSubmit}>Submit</Button>
            <br /> <br />
            {hardMode 
            ? <Button type="primary" size="medium" onClick={handleModeSwitch}>EASY MODE</Button>
            : <Button type="primary" size="medium" danger="true" onClick={handleModeSwitch}>HARD MODE</Button> }
            
            <p> Score: {score} </p>
        </div>
    )
    
}

export default Game;