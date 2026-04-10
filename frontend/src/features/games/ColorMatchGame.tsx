// ============================================================================
// COLOR MATCH GAME — Module D: Gamification
// ============================================================================
// A color word appears — click the right color button
// On complete: calls onComplete(score, duration_seconds)

import { useState, useEffect, useRef } from 'react';

interface ColorMatchGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const COLORS = [
  { id: 'red',    label: 'Rouge',  bg: '#ef4444' },
  { id: 'blue',   label: 'Bleu',   bg: '#3b82f6' },
  { id: 'green',  label: 'Vert',   bg: '#10b981' },
  { id: 'yellow', label: 'Jaune',  bg: '#f59e0b' },
  { id: 'purple', label: 'Violet', bg: '#8b5cf6' },
  { id: 'orange', label: 'Orange', bg: '#f97316' },
];

const TOTAL_ROUNDS = 10;

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export const ColorMatchGame = ({ onComplete, onClose }: ColorMatchGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  // The word shown can be a different color (Stroop effect — simplified for children)
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [choices, setChoices] = useState(COLORS.slice(0, 4));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);

  const nextRound = (currentRound: number) => {
    const target = pickRandom(COLORS);
    // Word is shown in a different color (Stroop effect, mild)
    const word = pickRandom(COLORS, target);
    // Pick 4 choices always including the target
    const others = COLORS.filter((c) => c.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const shuffled = [target, ...others].sort(() => Math.random() - 0.5);

    setTargetColor(target);
    setWordColor(word);
    setChoices(shuffled);
    setRound(currentRound);
    setFeedback(null);
    lockRef.current = false;
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = (colorId: string) => {
    if (lockRef.current || finished) return;
    lockRef.current = true;

    const isCorrect = colorId === targetColor.id;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const newScore = isCorrect ? score + 10 : score;
    setScore(newScore);

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setFinished(true);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onComplete(newScore, duration);
      } else {
        nextRound(round + 1);
      }
    }, 700);
  };

  const progressPct = ((round - 1) / TOTAL_ROUNDS) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '28px 28px 32px',
        maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>🎨 Jeu des couleurs</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Clique sur la bonne couleur !
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 10,
            width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b',
          }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 14px', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TOUR</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div style={{ background: '#fff7ed', borderRadius: 10, padding: '8px 14px', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SCORE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316' }}>{score}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 8, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            width: `${progressPct}%`, borderRadius: 8, transition: 'width 0.4s',
          }} />
        </div>

        {!finished && (
          <>
            {/* Instruction: word shown in a random color */}
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
              🖱️ Clique sur la couleur du MOT affiché :
            </p>

            {/* The word shown — color of word != its meaning (Stroop) */}
            <div style={{
              fontSize: 48, fontWeight: 900, marginBottom: 28,
              color: wordColor.bg,
              textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              letterSpacing: 2,
            }}>
              {targetColor.label}
            </div>

            {/* Feedback */}
            {feedback && (
              <div style={{
                marginBottom: 16, padding: '10px 16px', borderRadius: 10,
                background: feedback === 'correct' ? '#d1fae5' : '#fee2e2',
                color: feedback === 'correct' ? '#065f46' : '#991b1b',
                fontWeight: 700, fontSize: 15,
              }}>
                {feedback === 'correct' ? '✅ Correct ! +10 pts' : '❌ Essaie encore !'}
              </div>
            )}

            {/* Color buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChoice(c.id)}
                  style={{
                    padding: '18px 12px',
                    background: c.bg,
                    border: 'none',
                    borderRadius: 14,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {finished && (
          <div style={{ padding: '20px 0 8px' }}>
            <div style={{ fontSize: 48 }}>🎊</div>
            <p style={{ margin: '12px 0 6px', fontWeight: 800, fontSize: 20, color: '#1e3a5f' }}>
              Partie terminée !
            </p>
            <p style={{ margin: 0, fontSize: 15, color: '#64748b' }}>
              Score final : <strong style={{ color: '#f97316' }}>{score}</strong> / {TOTAL_ROUNDS * 10} pts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

