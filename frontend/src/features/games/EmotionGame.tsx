// ============================================================================
// EMOTION RECOGNITION GAME — Module D: Gamification
// ============================================================================
// Children learn to recognize emotions from emoji faces
// Great for autistic children developing emotional intelligence

import { useState, useEffect, useRef } from 'react';

interface EmotionGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const EMOTIONS = [
  { id: 'happy',     emoji: '😊', label: 'Content',    color: '#fbbf24' },
  { id: 'sad',       emoji: '😢', label: 'Triste',     color: '#60a5fa' },
  { id: 'angry',     emoji: '😠', label: 'En colère',  color: '#ef4444' },
  { id: 'surprised', emoji: '😲', label: 'Surpris',    color: '#a78bfa' },
  { id: 'scared',    emoji: '😨', label: 'Effrayé',    color: '#6ee7b7' },
  { id: 'love',      emoji: '🥰', label: 'Amoureux',   color: '#f472b6' },
  { id: 'sleepy',    emoji: '😴', label: 'Fatigué',    color: '#94a3b8' },
  { id: 'silly',     emoji: '🤪', label: 'Rigolo',     color: '#fb923c' },
];

const SCENARIOS = [
  { text: "Ton ami te fait un gros câlin",                  answer: 'happy' },
  { text: "Tu as perdu ton jouet préféré",                  answer: 'sad' },
  { text: "Quelqu'un a cassé ta tour de blocs exprès",      answer: 'angry' },
  { text: "Tes amis crient SURPRISE pour ton anniversaire", answer: 'surprised' },
  { text: "Il fait très noir et tu entends un bruit",       answer: 'scared' },
  { text: "Maman te fait un bisou sur le front",            answer: 'love' },
  { text: "C'est l'heure de dormir, tu bâilles beaucoup",  answer: 'sleepy' },
  { text: "Papa fait une grimace drôle",                    answer: 'silly' },
  { text: "Tu reçois un cadeau inattendu",                  answer: 'surprised' },
  { text: "Ton chat ronronne sur tes genoux",               answer: 'happy' },
  { text: "Tu dois quitter le parc de jeux",                answer: 'sad' },
  { text: "Un clown fait des bulles de savon géantes",      answer: 'silly' },
];

const TOTAL_ROUNDS = 8;

export const EmotionGame = ({ onComplete, onClose }: EmotionGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [choices, setChoices] = useState(EMOTIONS.slice(0, 4));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);
  const usedRef = useRef<Set<number>>(new Set());

  const nextRound = (r: number) => {
    // Pick unused scenario
    let idx: number;
    do { idx = Math.floor(Math.random() * SCENARIOS.length); }
    while (usedRef.current.has(idx) && usedRef.current.size < SCENARIOS.length);
    usedRef.current.add(idx);

    const sc = SCENARIOS[idx];
    const correct = EMOTIONS.find(e => e.id === sc.answer)!;
    const others = EMOTIONS.filter(e => e.id !== sc.answer).sort(() => Math.random() - 0.5).slice(0, 3);
    const shuffled = [correct, ...others].sort(() => Math.random() - 0.5);

    setScenario(sc);
    setChoices(shuffled);
    setRound(r);
    setFeedback(null);
    lockRef.current = false;
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  }, []);

  const handleChoice = (emotionId: string) => {
    if (lockRef.current || finished) return;
    lockRef.current = true;

    const isCorrect = emotionId === scenario.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const bonus = isCorrect ? (streak >= 2 ? 15 : 10) : 0;
    const newScore = score + bonus;
    setScore(newScore);
    setStreak(isCorrect ? streak + 1 : 0);

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
  const correctEmotion = EMOTIONS.find(e => e.id === scenario.answer);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-800">🎭 Devine l'émotion</h2>
            <p className="text-xs text-slate-500 mt-1">Lis la situation et choisis l'émotion !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-purple-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tour</div>
            <div className="text-lg font-extrabold text-purple-600">{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-amber-600">{score}</div>
          </div>
          {streak >= 2 && (
            <div className="flex-1 bg-red-50 rounded-xl py-2 px-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Série</div>
              <div className="text-lg font-extrabold text-red-500">🔥 {streak}</div>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished ? (
          <>
            {/* Scenario */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-100">
              <p className="text-lg font-bold text-slate-800 leading-relaxed">
                "{scenario.text}"
              </p>
              <p className="text-xs text-slate-500 mt-2">Comment tu te sentirais ?</p>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-3 px-4 rounded-xl font-bold text-sm ${
                feedback === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback === 'correct'
                  ? `✅ Bravo ! +${streak >= 2 ? 15 : 10} pts${streak >= 2 ? ' (bonus série !)' : ''}`
                  : `❌ C'était : ${correctEmotion?.emoji} ${correctEmotion?.label}`}
              </div>
            )}

            {/* Emotion choices */}
            <div className="grid grid-cols-2 gap-3">
              {choices.map(em => (
                <button
                  key={em.id}
                  onClick={() => handleChoice(em.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-300 hover:bg-purple-50 transition-all hover:scale-[1.03] active:scale-95"
                  style={{ cursor: lockRef.current ? 'default' : 'pointer' }}
                >
                  <span className="text-5xl">{em.emoji}</span>
                  <span className="text-sm font-bold text-slate-700">{em.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-2xl font-extrabold text-purple-700 mb-2">Super travail !</h3>
            <p className="text-slate-600 mb-1">Tu deviens un expert des émotions !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} pts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionGame;


