// ============================================================================
// GAME COMPONENTS & LOGIC
// ============================================================================
// Simple games for autistic children

import { useState, useEffect, useRef } from 'react';

interface ColorHex {
  [key: string]: string;
  red: string;
  blue: string;
  yellow: string;
  green: string;
  purple: string;
}

interface SoundOption {
  name: string;
  emoji: string;
  sound: string;
}

interface GamesContainerProps {
  onGameScore?: (gameId: string, score: number, duration: number) => void;
}

// ============================================================================
// GAME 1: COLOR MATCH
// ============================================================================
// User sees a color name and must click the correct color button

interface GameProps {
  onGameEnd?: (gameId: string, score: number) => void;
}

export const ColorMatchGame = ({ onGameEnd }: GameProps): JSX.Element => {
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [colorName, setColorName] = useState<string>('');
  const [correctColor, setCorrectColor] = useState<string>('');
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const colors = ['red', 'blue', 'yellow', 'green', 'purple'];
  const colorHex: ColorHex = {
    red: '#FF0000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    green: '#00AA00',
    purple: '#AA00AA'
  };

  const startRound = (): void => {
    if (round >= 10) {
      // Game ended after 10 rounds
      setGameEnded(true);
      if (onGameEnd) {
        onGameEnd('color_match', score);
      }
      return;
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setColorName(randomColor);
    setCorrectColor(randomColor);
    setRound(round + 1);
  };

  const handleColorClick = (selectedColor: string): void => {
    if (selectedColor === correctColor) {
      setScore(score + 1);
      setTimeout(() => startRound(), 500);
    }
  };

  useEffect(() => {
    if (round === 0) startRound();
  }, []);

  if (gameEnded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🎉 Game Over!</h2>
        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>Final Score: {score}/10</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Color Match Game</h2>
      <p>Round: {round}/10</p>
      <p>Score: {score}</p>
      <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>
        Click: <span style={{ color: colorHex[colorName] }}>{colorName}</span>
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: colorHex[color],
              border: '2px solid black',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// GAME 2: MEMORY GAME
// ============================================================================
// Match pairs of cards

export const MemoryGame = ({ onGameEnd }: GameProps): JSX.Element => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  useEffect(() => {
    // Initialize game
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped(new Array(16).fill(false));
  }, []);

  useEffect(() => {
    // Check if game ended (all 8 pairs found)
    if (score === 8 && score > 0) {
      setGameEnded(true);
      if (onGameEnd) {
        onGameEnd('memory', score);
      }
    }
  }, [score, onGameEnd]);

  const handleCardClick = (index: number): void => {
    if (flipped[index] || flipped.filter((f, i) => f && i !== index).length === 0) return;

    const newFlipped = [...flipped];
    newFlipped[index] = true;
    setFlipped(newFlipped);
    setMoves(moves + 1);

    const flippedIndices = newFlipped.map((f, i) => f ? i : null).filter((i): i is number => i !== null);

    if (flippedIndices.length === 2) {
      if (cards[flippedIndices[0]] === cards[flippedIndices[1]]) {
        setScore(score + 1);
      } else {
        setTimeout(() => {
          const reset = [...newFlipped];
          reset[flippedIndices[0]] = false;
          reset[flippedIndices[1]] = false;
          setFlipped(reset);
        }, 1000);
      }
    }
  };

  if (gameEnded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🎉 Game Over!</h2>
        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>Final Score: {score}/8</p>
        <p>Moves: {moves}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Memory Game</h2>
      <p>Score: {score}/8 | Moves: {moves}</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 80px)',
        gap: '10px',
        justifyContent: 'center'
      }}>
        {cards.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              width: '80px',
              height: '80px',
              fontSize: '40px',
              border: '2px solid #333',
              borderRadius: '5px',
              backgroundColor: flipped[index] ? '#fff' : '#ddd',
              cursor: 'pointer'
            }}
          >
            {flipped[index] ? emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// GAME 3: SOUND RECOGNITION
// ============================================================================
// Hear a sound, select the correct image

export const SoundRecognitionGame = ({ onGameEnd }: GameProps): JSX.Element => {
  const [score, setScore] = useState<number>(0);
  const [currentSound, setCurrentSound] = useState<string>('');
  const [options, setOptions] = useState<SoundOption[]>([]);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const soundOptions: SoundOption[] = [
    { name: 'dog', emoji: '🐶', sound: 'woof' },
    { name: 'cat', emoji: '🐱', sound: 'meow' },
    { name: 'bird', emoji: '🐦', sound: 'chirp' },
    { name: 'duck', emoji: '🦆', sound: 'quack' }
  ];

  useEffect(() => {
    // Check if game ended (5 correct answers)
    if (score === 5 && score > 0) {
      setGameEnded(true);
      if (onGameEnd) {
        onGameEnd('sound_recognition', score);
      }
    }
  }, [score, onGameEnd]);

  const playSound = (soundName: string): void => {
    // In production, this would use Web Audio API
    console.log(`Playing sound: ${soundName}`);
  };

  const handleOptionClick = (selected: SoundOption): void => {
    if (selected.name === currentSound) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore < 5) {
        setTimeout(() => startRound(), 500);
      }
    } else {
      alert('Try again!');
    }
  };

  const startRound = (): void => {
    const randomOption = soundOptions[Math.floor(Math.random() * soundOptions.length)];
    setCurrentSound(randomOption.name);

    const shuffledOptions = [...soundOptions].sort(() => Math.random() - 0.5);
    setOptions(shuffledOptions);

    playSound(randomOption.sound);
  };

  useEffect(() => {
    startRound();
  }, []);

  if (gameEnded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🎉 Game Over!</h2>
        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>Final Score: {score}/5</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Sound Recognition Game</h2>
      <p>Score: {score}/5</p>
      <button
        onClick={() => playSound(currentSound)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        🔊 Replay Sound
      </button>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {options.map((option) => (
          <button
            key={option.name}
            onClick={() => handleOptionClick(option)}
            style={{
              width: '100px',
              height: '100px',
              fontSize: '50px',
              border: '2px solid #333',
              borderRadius: '5px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            {option.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// GAMES CONTAINER
// ============================================================================

export const GamesContainer = ({ onGameScore }: GamesContainerProps): JSX.Element => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const startTime = useRef<number>(0);

  const handleGameEnd = (gameId: string, score: number): void => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    if (onGameScore) {
      onGameScore(gameId, score, duration);
    }
  };

  if (currentGame === 'color') return <ColorMatchGame onGameEnd={handleGameEnd} />;
  if (currentGame === 'memory') return <MemoryGame onGameEnd={handleGameEnd} />;
  if (currentGame === 'sound') return <SoundRecognitionGame onGameEnd={handleGameEnd} />;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Choose a Game</h1>
      <button
        onClick={() => {
          startTime.current = Date.now();
          setCurrentGame('color');
        }}
        style={{
          padding: '15px 30px',
          margin: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        🎨 Color Match
      </button>
      <button
        onClick={() => {
          startTime.current = Date.now();
          setCurrentGame('memory');
        }}
        style={{
          padding: '15px 30px',
          margin: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4ECDC4',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        🎮 Memory Game
      </button>
      <button
        onClick={() => {
          startTime.current = Date.now();
          setCurrentGame('sound');
        }}
        style={{
          padding: '15px 30px',
          margin: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#FFE66D',
          color: 'black',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        🔊 Sound Recognition
      </button>
    </div>
  );
};


