// ============================================================================
// COUNTING GAME — Module D: Gamification
// ============================================================================
// Children count objects displayed on screen and pick the right number
// Reinforces numeracy skills in a fun visual way

import { useState, useEffect, useRef } from 'react';

interface CountingGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const OBJECTS = [
  { emoji: '⭐', label: 'étoiles' },
  { emoji: '🍎', label: 'pommes' },
  { emoji: '🌸', label: 'fleurs' },
  { emoji: '🐟', label: 'poissons' },
  { emoji: '🦋', label: 'papillons' },
  { emoji: '🎈', label: 'ballons' },
  { emoji: '🐣', label: 'poussins' },
  { emoji: '🍪', label: 'biscuits' },
  { emoji: '🌈', label: 'arcs-en-ciel' },
  { emoji: '🐞', label: 'coccinelles' },
];

const TOTAL_ROUNDS = 8;

export const CountingGame = ({ onComplete, onClose }: CountingGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [object, setObject] = useState(OBJECTS[0]);
  const [count, setCount] = useState(3);
  const [choices, setChoices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);

  const nextRound = (r: number) => {
    const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const cnt = Math.floor(Math.random() * 8) + 2; // 2-9
    // Generate 4 choices including the correct one
    const choiceSet = new Set<number>([cnt]);
    while (choiceSet.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const val = cnt + offset;
      if (val >= 1 && val <= 12 && val !== cnt) choiceSet.add(val);
      else choiceSet.add(Math.floor(Math.random() * 10) + 1);
    }
    setObject(obj);
    setCount(cnt);
    setChoices([...choiceSet].sort(() => Math.random() - 0.5));
    setRound(r);
    setFeedback(null);
    lockRef.current = false;
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  }, []);

  const handleChoice = (n: number) => {
    if (lockRef.current || finished) return;
    lockRef.current = true;

    const isCorrect = n === count;
    setFeedback(isCorrect ? 'correct' : 'wrong');
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
    }, 1000);
  };

  const progressPct = ((round - 1) / TOTAL_ROUNDS) * 100;

  // Generate the emoji display in a scattered pattern
  const emojiDisplay = Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      className="text-4xl inline-block animate-bounce"
      style={{
        animationDelay: `${i * 0.1}s`,
        animationDuration: '2s',
      }}
    >
      {object.emoji}
    </span>
  ));

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-800">🔢 Combien y en a-t-il ?</h2>
            <p className="text-xs text-slate-500 mt-1">Compte les objets et clique sur le bon nombre !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-cyan-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tour</div>
            <div className="text-lg font-extrabold text-cyan-600">{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-amber-600">{score}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished ? (
          <>
            {/* Objects display */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6 mb-5 min-h-[100px] flex flex-wrap items-center justify-center gap-3">
              {emojiDisplay}
            </div>

            <p className="text-base font-bold text-slate-700 mb-5">
              Combien de {object.label} vois-tu ? 👀
            </p>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-2.5 px-4 rounded-xl font-bold text-sm ${
                feedback === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback === 'correct' ? `✅ Bravo ! Il y en a bien ${count} !` : `❌ Non, il y en a ${count} !`}
              </div>
            )}

            {/* Number choices */}
            <div className="grid grid-cols-4 gap-3">
              {choices.map(n => (
                <button
                  key={n}
                  onClick={() => handleChoice(n)}
                  className="py-4 rounded-2xl border-2 border-cyan-200 bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all text-2xl font-extrabold text-slate-800 hover:scale-110 active:scale-95"
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-extrabold text-cyan-700 mb-2">Bien compté !</h3>
            <p className="text-slate-600 mb-1">Tu es un(e) champion(ne) des nombres !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} / {TOTAL_ROUNDS * 10} pts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountingGame;

