// ============================================================================
// PUZZLE WORD GAME — Module D: Gamification
// ============================================================================
// Children see an image (emoji) and must spell the word by picking letters
// Develops literacy and word recognition skills

import { useState, useEffect, useRef } from 'react';

interface PuzzleWordGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const WORDS = [
  { emoji: '☀️', word: 'SOLEIL',   hint: 'Il brille dans le ciel' },
  { emoji: '🌙', word: 'LUNE',     hint: 'On la voit la nuit' },
  { emoji: '🐱', word: 'CHAT',     hint: 'Il fait miaou' },
  { emoji: '🐶', word: 'CHIEN',    hint: 'Le meilleur ami de l\'homme' },
  { emoji: '🍎', word: 'POMME',    hint: 'Un fruit rouge' },
  { emoji: '🌳', word: 'ARBRE',    hint: 'Il a des feuilles' },
  { emoji: '🌸', word: 'FLEUR',    hint: 'Elle sent bon' },
  { emoji: '🏠', word: 'MAISON',   hint: 'On y habite' },
  { emoji: '⭐', word: 'ETOILE',   hint: 'Elle brille la nuit' },
  { emoji: '🐟', word: 'POISSON',  hint: 'Il nage dans l\'eau' },
  { emoji: '🎈', word: 'BALLON',   hint: 'Il vole dans les airs' },
  { emoji: '📚', word: 'LIVRE',    hint: 'On le lit' },
];

const TOTAL_ROUNDS = 6;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const PuzzleWordGame = ({ onComplete, onClose }: PuzzleWordGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [letters, setLetters] = useState<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const usedRef = useRef<Set<number>>(new Set());

  const nextRound = (r: number) => {
    let idx: number;
    do { idx = Math.floor(Math.random() * WORDS.length); }
    while (usedRef.current.has(idx) && usedRef.current.size < WORDS.length);
    usedRef.current.add(idx);

    const w = WORDS[idx];
    const wordLetters = w.word.split('');
    // Add some distractors
    const distractors = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !wordLetters.includes(l));
    const extra = shuffle(distractors).slice(0, Math.min(3, 26 - wordLetters.length));
    const allLetters = shuffle([...wordLetters, ...extra]);

    setCurrentWord(w);
    setLetters(allLetters);
    setPlaced(Array(w.word.length).fill(null));
    setRound(r);
    setFeedback(null);
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  }, []);

  const handleLetterClick = (letter: string, letterIdx: number) => {
    if (feedback || finished) return;

    // Find first empty slot
    const emptySlot = placed.findIndex(p => p === null);
    if (emptySlot === -1) return;

    const newPlaced = [...placed];
    newPlaced[emptySlot] = letter;
    setPlaced(newPlaced);

    // Remove used letter
    const newLetters = [...letters];
    newLetters.splice(letterIdx, 1);
    setLetters(newLetters);

    // Check if word is complete
    if (newPlaced.every(p => p !== null)) {
      const formed = newPlaced.join('');
      const isCorrect = formed === currentWord.word;
      setFeedback(isCorrect ? 'correct' : 'wrong');
      const newScore = score + (isCorrect ? 15 : 0);
      setScore(newScore);

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setFinished(true);
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          onComplete(newScore, duration);
        } else {
          nextRound(round + 1);
        }
      }, 1500);
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    if (feedback || finished) return;
    const letter = placed[slotIdx];
    if (!letter) return;

    const newPlaced = [...placed];
    newPlaced[slotIdx] = null;
    setPlaced(newPlaced);
    setLetters(prev => [...prev, letter]);
  };

  const progressPct = ((round - 1) / TOTAL_ROUNDS) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-800">🔤 Mot mystère</h2>
            <p className="text-xs text-slate-500 mt-1">Reconstitue le mot en cliquant sur les lettres !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-rose-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tour</div>
            <div className="text-lg font-extrabold text-rose-600">{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-amber-600">{score}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished ? (
          <>
            {/* Emoji + Hint */}
            <div className="mb-5">
              <div className="text-7xl mb-3">{currentWord.emoji}</div>
              <p className="text-sm text-slate-500 italic">💡 {currentWord.hint}</p>
            </div>

            {/* Word slots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {placed.map((letter, i) => (
                <div
                  key={i}
                  onClick={() => handleSlotClick(i)}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-extrabold transition-all ${
                    letter
                      ? feedback === 'correct'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : feedback === 'wrong'
                          ? 'bg-red-100 border-red-400 text-red-800'
                          : 'bg-rose-50 border-rose-300 text-slate-800 cursor-pointer hover:bg-rose-100'
                      : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  {letter || ''}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-2.5 px-4 rounded-xl font-bold text-sm ${
                feedback === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback === 'correct'
                  ? `✅ Bravo ! C'est bien "${currentWord.word}" ! +15 pts`
                  : `❌ Le mot était "${currentWord.word}"`}
              </div>
            )}

            {/* Available letters */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {letters.map((letter, i) => (
                <button
                  key={`${letter}-${i}`}
                  onClick={() => handleLetterClick(letter, i)}
                  className="w-11 h-11 rounded-xl bg-gradient-to-b from-rose-100 to-rose-200 border border-rose-300 text-lg font-extrabold text-slate-800 hover:scale-110 hover:from-rose-200 hover:to-rose-300 active:scale-95 transition-all"
                >
                  {letter}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-extrabold text-rose-700 mb-2">Super lecteur !</h3>
            <p className="text-slate-600 mb-1">Tu connais plein de mots !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} / {TOTAL_ROUNDS * 15} pts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleWordGame;

