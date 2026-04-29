// ============================================================================
// MEMORY GAME — Module D: Gamification
// ============================================================================
// Card-flip memory matching game for autistic children
// On complete: calls onComplete(score, duration_seconds)

import { useState, useEffect, useCallback } from 'react';

interface MemoryGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const CARD_PAIRS = [
  { id: 'sun',    emoji: '☀️', label: 'Soleil' },
  { id: 'flower', emoji: '🌸', label: 'Fleur' },
  { id: 'star',   emoji: '⭐', label: 'Étoile' },
  { id: 'heart',  emoji: '❤️', label: 'Cœur' },
  { id: 'tree',   emoji: '🌳', label: 'Arbre' },
  { id: 'cat',    emoji: '🐱', label: 'Chat' },
  { id: 'apple',  emoji: '🍎', label: 'Pomme' },
  { id: 'moon',   emoji: '🌙', label: 'Lune' },
];

interface Card {
  uid: string;
  id: string;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const MemoryGame = ({ onComplete, onClose }: MemoryGameProps): JSX.Element => {
  const [cards, setCards] = useState<Card[]>([]);
  const [, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  // Initialize cards
  useEffect(() => {
    const doubled: Card[] = shuffle(
      CARD_PAIRS.flatMap((p) => [
        { uid: `${p.id}-a`, id: p.id, emoji: p.emoji, label: p.label, flipped: false, matched: false },
        { uid: `${p.id}-b`, id: p.id, emoji: p.emoji, label: p.label, flipped: false, matched: false },
      ])
    );
    setCards(doubled);
  }, []);

  const handleFlip = useCallback((uid: string) => {
    if (locked || finished) return;

    setCards((prev) => {
      const card = prev.find((c) => c.uid === uid);
      if (!card || card.flipped || card.matched) return prev;
      return prev.map((c) => c.uid === uid ? { ...c, flipped: true } : c);
    });

    setSelected((prev) => {
      const next = [...prev, uid];

      if (next.length === 2) {
        setLocked(true);
        setMoves((m) => m + 1);

        setTimeout(() => {
          setCards((prevCards) => {
            const [a, b] = [prevCards.find((c) => c.uid === next[0])!, prevCards.find((c) => c.uid === next[1])!];
            const isMatch = a && b && a.id === b.id;

            if (isMatch) {
              const updated = prevCards.map((c) =>
                c.uid === next[0] || c.uid === next[1] ? { ...c, matched: true } : c
              );
              const newMatchCount = updated.filter((c) => c.matched).length / 2;
              setMatchedCount(newMatchCount);

              if (newMatchCount === CARD_PAIRS.length) {
                setFinished(true);
                const duration = Math.round((Date.now() - startTime) / 1000);
                const score = Math.max(10, 100 - (moves + 1) * 3);
                setTimeout(() => onComplete(score, duration), 600);
              }

              return updated;
            } else {
              return prevCards.map((c) =>
                c.uid === next[0] || c.uid === next[1] ? { ...c, flipped: false } : c
              );
            }
          });

          setLocked(false);
          return [];
        }, 900);

        return next;
      }

      return next;
    });
  }, [locked, finished, moves, startTime, onComplete]);

  const progressPct = (matchedCount / CARD_PAIRS.length) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '28px 28px 32px',
        maxWidth: 560, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>🧠 Jeu de mémoire</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Retourne les cartes et trouve les paires !
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 10,
            width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b',
          }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 14px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PAIRES</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{matchedCount}/{CARD_PAIRS.length}</div>
          </div>
          <div style={{ background: '#fff7ed', borderRadius: 10, padding: '8px 14px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MOUVEMENTS</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316' }}>{moves}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 8, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)',
            width: `${progressPct}%`, borderRadius: 8, transition: 'width 0.4s',
          }} />
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {cards.map((card) => (
            <div
              key={card.uid}
              onClick={() => handleFlip(card.uid)}
              style={{
                aspectRatio: '1',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: card.flipped || card.matched ? 32 : 28,
                cursor: card.flipped || card.matched || locked ? 'default' : 'pointer',
                background: card.matched
                  ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                  : card.flipped
                    ? '#fff'
                    : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                border: card.matched
                  ? '2px solid #10b981'
                  : card.flipped
                    ? '2px solid #e2e8f0'
                    : '2px solid transparent',
                boxShadow: card.matched
                  ? '0 2px 8px rgba(16,185,129,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                transform: card.flipped || card.matched ? 'rotateY(0)' : 'rotateY(0)',
                userSelect: 'none',
              }}
            >
              {card.flipped || card.matched ? card.emoji : '?'}
            </div>
          ))}
        </div>

        {finished && (
          <div style={{
            marginTop: 20, textAlign: 'center', background: '#f0fdf4',
            borderRadius: 16, padding: '16px 20px', border: '2px solid #10b981',
          }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <p style={{ margin: '8px 0 4px', fontWeight: 800, fontSize: 18, color: '#065f46' }}>
              Bravo ! Toutes les paires trouvées !
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#059669' }}>
              {moves} mouvements • Score: {Math.max(10, 100 - moves * 3)} pts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


