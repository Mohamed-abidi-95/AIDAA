// ============================================================================
// PATTERN GAME — Module D: Gamification
// ============================================================================
// Children complete visual patterns (sequences of emojis)
// Develops logical thinking and pattern recognition

import { useState, useEffect, useRef } from 'react';

interface PatternGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

interface PatternRound {
  sequence: string[];
  missing: number;
  choices: string[];
  answer: string;
}

const PATTERN_TEMPLATES = [
  // AB patterns
  { pattern: ['🔴', '🔵'], length: 6 },
  { pattern: ['⭐', '🌙'], length: 6 },
  { pattern: ['🍎', '🍊'], length: 6 },
  { pattern: ['🐱', '🐶'], length: 6 },
  // ABC patterns
  { pattern: ['🔴', '🔵', '🟢'], length: 6 },
  { pattern: ['⭐', '🌙', '☀️'], length: 6 },
  { pattern: ['🍎', '🍌', '🍇'], length: 6 },
  { pattern: ['🐱', '🐶', '🐰'], length: 6 },
  // AABB patterns
  { pattern: ['🔴', '🔴', '🔵', '🔵'], length: 8 },
  { pattern: ['🌸', '🌸', '🌻', '🌻'], length: 8 },
  // ABB patterns
  { pattern: ['⭐', '🌙', '🌙'], length: 6 },
  { pattern: ['🎈', '🎀', '🎀'], length: 6 },
];

const TOTAL_ROUNDS = 8;

function generateRound(): PatternRound {
  const template = PATTERN_TEMPLATES[Math.floor(Math.random() * PATTERN_TEMPLATES.length)];
  const { pattern, length } = template;

  // Build the full sequence
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(pattern[i % pattern.length]);
  }

  // Pick a position to hide (not the first one)
  const missing = Math.floor(Math.random() * (length - 1)) + 1;
  const answer = sequence[missing];

  // Build choices — always include correct answer + distractors from the pattern + random
  const choiceSet = new Set<string>([answer]);
  for (const p of pattern) choiceSet.add(p);
  const distractors = ['🔴', '🔵', '🟢', '🟡', '⭐', '🌙', '🍎', '🍌', '🐱', '🐶', '🌸', '🎈'];
  while (choiceSet.size < 4) {
    choiceSet.add(distractors[Math.floor(Math.random() * distractors.length)]);
  }

  const choices = [...choiceSet].sort(() => Math.random() - 0.5);

  return { sequence, missing, choices, answer };
}

export const PatternGame = ({ onComplete, onClose }: PatternGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [currentRound, setCurrentRound] = useState<PatternRound | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);

  const nextRound = (r: number) => {
    setCurrentRound(generateRound());
    setRound(r);
    setFeedback(null);
    setRevealed(false);
    lockRef.current = false;
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  }, []);

  const handleChoice = (emoji: string) => {
    if (lockRef.current || finished || !currentRound) return;
    lockRef.current = true;

    const isCorrect = emoji === currentRound.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setRevealed(true);
    const newScore = score + (isCorrect ? 10 : 0);
    setScore(newScore);

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setFinished(true);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onComplete(newScore, duration);
      } else {
        nextRound(round + 1);
      }
    }, 1200);
  };

  const progressPct = ((round - 1) / TOTAL_ROUNDS) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-800">🧩 Complète le motif</h2>
            <p className="text-xs text-slate-500 mt-1">Trouve l'élément manquant dans la séquence !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-indigo-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tour</div>
            <div className="text-lg font-extrabold text-indigo-600">{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-amber-600">{score}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished && currentRound ? (
          <>
            {/* Sequence display */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {currentRound.sequence.map((emoji, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                      i === currentRound.missing
                        ? revealed
                          ? 'bg-emerald-100 border-2 border-emerald-400 scale-110'
                          : 'bg-white border-2 border-dashed border-indigo-400 animate-pulse'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    {i === currentRound.missing
                      ? (revealed ? currentRound.answer : '❓')
                      : emoji
                    }
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm font-bold text-slate-600 mb-4">Quel élément remplace le ❓ ?</p>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-2.5 px-4 rounded-xl font-bold text-sm ${
                feedback === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback === 'correct' ? '✅ Parfait ! Tu as trouvé le motif !' : `❌ C'était ${currentRound.answer}`}
              </div>
            )}

            {/* Choices */}
            <div className="grid grid-cols-4 gap-3">
              {currentRound.choices.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(emoji)}
                  className="py-4 rounded-2xl border-2 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-all text-3xl hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        ) : finished ? (
          <div className="py-6">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-2xl font-extrabold text-indigo-700 mb-2">Expert des motifs !</h3>
            <p className="text-slate-600 mb-1">Tu reconnais super bien les séquences !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} / {TOTAL_ROUNDS * 10} pts</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PatternGame;

