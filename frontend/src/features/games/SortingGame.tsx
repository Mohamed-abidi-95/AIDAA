// ============================================================================
// SORTING GAME — Module D: Gamification
// ============================================================================
// Children sort items into the correct categories (animals, fruits, vehicles...)
// Helps with categorization skills — key for autistic children

import { useState, useEffect, useRef } from 'react';

interface SortingGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

interface SortItem {
  id: string;
  emoji: string;
  label: string;
  category: string;
}

const CATEGORIES = [
  { id: 'animaux',   label: 'Animaux 🐾',  color: '#10b981', bg: '#d1fae5' },
  { id: 'fruits',    label: 'Fruits 🍎',    color: '#f59e0b', bg: '#fef3c7' },
  { id: 'vehicules', label: 'Véhicules 🚗', color: '#3b82f6', bg: '#dbeafe' },
];

const ALL_ITEMS: SortItem[] = [
  { id: 'chien',    emoji: '🐕', label: 'Chien',    category: 'animaux' },
  { id: 'chat',     emoji: '🐱', label: 'Chat',     category: 'animaux' },
  { id: 'oiseau',   emoji: '🐦', label: 'Oiseau',   category: 'animaux' },
  { id: 'poisson',  emoji: '🐟', label: 'Poisson',  category: 'animaux' },
  { id: 'lapin',    emoji: '🐰', label: 'Lapin',    category: 'animaux' },
  { id: 'pomme',    emoji: '🍎', label: 'Pomme',    category: 'fruits' },
  { id: 'banane',   emoji: '🍌', label: 'Banane',   category: 'fruits' },
  { id: 'raisin',   emoji: '🍇', label: 'Raisin',   category: 'fruits' },
  { id: 'fraise',   emoji: '🍓', label: 'Fraise',   category: 'fruits' },
  { id: 'orange',   emoji: '🍊', label: 'Orange',   category: 'fruits' },
  { id: 'voiture',  emoji: '🚗', label: 'Voiture',  category: 'vehicules' },
  { id: 'bus',      emoji: '🚌', label: 'Bus',      category: 'vehicules' },
  { id: 'avion',    emoji: '✈️', label: 'Avion',    category: 'vehicules' },
  { id: 'velo',     emoji: '🚲', label: 'Vélo',     category: 'vehicules' },
  { id: 'bateau',   emoji: '⛵', label: 'Bateau',   category: 'vehicules' },
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const SortingGame = ({ onComplete, onClose }: SortingGameProps): JSX.Element => {
  const [, setItems] = useState<SortItem[]>([]);
  const [sorted, setSorted] = useState<Record<string, SortItem[]>>({});
  const [currentItem, setCurrentItem] = useState<SortItem | null>(null);
  const [remaining, setRemaining] = useState<SortItem[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [total, setTotal] = useState(0);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);

  useEffect(() => {
    // Pick 3 items per category
    const perCat = 3;
    const selected: SortItem[] = [];
    for (const cat of CATEGORIES) {
      const catItems = ALL_ITEMS.filter(i => i.category === cat.id);
      selected.push(...shuffle(catItems).slice(0, perCat));
    }
    const shuffled = shuffle(selected);
    setItems(shuffled);
    setRemaining(shuffled.slice(1));
    setCurrentItem(shuffled[0]);
    setTotal(shuffled.length);
    setSorted({ animaux: [], fruits: [], vehicules: [] });
    startTimeRef.current = Date.now();
  }, []);

  const handleDrop = (categoryId: string) => {
    if (!currentItem || lockRef.current || finished) return;
    lockRef.current = true;

    const isCorrect = currentItem.category === categoryId;
    const points = isCorrect ? 10 : 0;
    const newScore = score + points;
    setScore(newScore);

    if (isCorrect) {
      setSorted(prev => ({ ...prev, [categoryId]: [...prev[categoryId], currentItem] }));
      setFeedback({ type: 'correct', text: `✅ Oui ! ${currentItem.emoji} ${currentItem.label} est un(e) ${CATEGORIES.find(c => c.id === categoryId)?.label}` });
    } else {
      const correctCat = CATEGORIES.find(c => c.id === currentItem.category);
      setFeedback({ type: 'wrong', text: `❌ Non ! ${currentItem.emoji} ${currentItem.label} va dans ${correctCat?.label}` });
      setSorted(prev => ({ ...prev, [currentItem!.category]: [...prev[currentItem!.category], currentItem!] }));
    }

    setTimeout(() => {
      if (remaining.length === 0) {
        setFinished(true);
        setCurrentItem(null);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onComplete(newScore, duration);
      } else {
        setCurrentItem(remaining[0]);
        setRemaining(prev => prev.slice(1));
        setFeedback(null);
      }
      lockRef.current = false;
    }, 1000);
  };

  const progressPct = total > 0 ? ((total - remaining.length - (currentItem ? 1 : 0)) / total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">🗂️ Jeu de tri</h2>
            <p className="text-xs text-slate-500 mt-1">Place chaque élément dans la bonne catégorie !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-emerald-50 rounded-xl py-2 px-3 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-emerald-600">{score}</div>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl py-2 px-3 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Restant</div>
            <div className="text-lg font-extrabold text-blue-600">{remaining.length + (currentItem ? 1 : 0)}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished ? (
          <>
            {/* Current item */}
            {currentItem && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl px-8 py-5 shadow-md">
                  <span className="text-5xl">{currentItem.emoji}</span>
                  <span className="text-xl font-extrabold text-slate-800">{currentItem.label}</span>
                </div>
                <p className="text-sm text-slate-500 mt-3">👆 Où va cet élément ?</p>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-2.5 px-4 rounded-xl text-sm font-bold text-center ${
                feedback.type === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* Categories */}
            <div className="grid grid-cols-3 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleDrop(cat.id)}
                  className="rounded-2xl p-4 border-2 border-dashed transition-all hover:scale-[1.03] active:scale-95 min-h-[140px] flex flex-col"
                  style={{
                    borderColor: cat.color,
                    backgroundColor: cat.bg,
                    cursor: lockRef.current ? 'default' : 'pointer',
                  }}
                >
                  <p className="text-sm font-extrabold mb-3" style={{ color: cat.color }}>{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {sorted[cat.id]?.map(item => (
                      <span key={item.id} className="text-2xl">{item.emoji}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-extrabold text-emerald-700 mb-2">Tri terminé !</h3>
            <p className="text-slate-600 mb-1">Tu sais bien classer les choses !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} / {total * 10} pts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortingGame;


