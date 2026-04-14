// ============================================================================
// SOUND IMITATION GAME — Module D: Gamification
// ============================================================================
// Children hear an animal/object sound description and pick the right match
// Uses visual + textual cues since Web Audio may not be available

import { useState, useEffect, useRef } from 'react';

interface SoundGameProps {
  onComplete: (score: number, durationSeconds: number) => void;
  onClose: () => void;
}

const SOUNDS = [
  { id: 'cat',     emoji: '🐱', label: 'Chat',     sound: 'Miaou !',     onomatopoeia: 'MIAOU' },
  { id: 'dog',     emoji: '🐶', label: 'Chien',    sound: 'Ouaf ouaf !',  onomatopoeia: 'OUAF' },
  { id: 'cow',     emoji: '🐮', label: 'Vache',    sound: 'Meuh !',       onomatopoeia: 'MEUH' },
  { id: 'rooster', emoji: '🐓', label: 'Coq',      sound: 'Cocorico !',   onomatopoeia: 'COCORICO' },
  { id: 'duck',    emoji: '🦆', label: 'Canard',   sound: 'Coin coin !',  onomatopoeia: 'COIN COIN' },
  { id: 'sheep',   emoji: '🐑', label: 'Mouton',   sound: 'Bêê !',        onomatopoeia: 'BÊÊ' },
  { id: 'pig',     emoji: '🐷', label: 'Cochon',   sound: 'Groin groin !', onomatopoeia: 'GROIN' },
  { id: 'lion',    emoji: '🦁', label: 'Lion',     sound: 'Grr Roaar !',  onomatopoeia: 'ROAAR' },
  { id: 'frog',    emoji: '🐸', label: 'Grenouille', sound: 'Coâ coâ !',  onomatopoeia: 'COÂ COÂ' },
  { id: 'bird',    emoji: '🐦', label: 'Oiseau',   sound: 'Cui cui !',    onomatopoeia: 'CUI CUI' },
  { id: 'bee',     emoji: '🐝', label: 'Abeille',  sound: 'Bzzz !',       onomatopoeia: 'BZZZ' },
  { id: 'snake',   emoji: '🐍', label: 'Serpent',  sound: 'Ssss !',       onomatopoeia: 'SSSS' },
];

const TOTAL_ROUNDS = 10;

export const SoundGame = ({ onComplete, onClose }: SoundGameProps): JSX.Element => {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(SOUNDS[0]);
  const [choices, setChoices] = useState(SOUNDS.slice(0, 4));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const startTimeRef = useRef(Date.now());
  const lockRef = useRef(false);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    utt.rate = 0.8;
    utt.pitch = 1.2;
    window.speechSynthesis.speak(utt);
  };

  const nextRound = (r: number) => {
    const t = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
    const others = SOUNDS.filter(s => s.id !== t.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const shuffled = [t, ...others].sort(() => Math.random() - 0.5);

    setTarget(t);
    setChoices(shuffled);
    setRound(r);
    setFeedback(null);
    setShowSound(false);
    lockRef.current = false;

    // Auto-play the sound description
    setTimeout(() => {
      setShowSound(true);
      speak(t.sound);
    }, 500);
  };

  useEffect(() => {
    nextRound(1);
    startTimeRef.current = Date.now();
  }, []);

  const handleChoice = (id: string) => {
    if (lockRef.current || finished) return;
    lockRef.current = true;

    const isCorrect = id === target.id;
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
    }, 1200);
  };

  const progressPct = ((round - 1) / TOTAL_ROUNDS) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-slate-800">🔊 Qui fait ce bruit ?</h2>
            <p className="text-xs text-slate-500 mt-1">Écoute le son et trouve l'animal !</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-orange-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tour</div>
            <div className="text-lg font-extrabold text-orange-600">{round}/{TOTAL_ROUNDS}</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl py-2 px-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            <div className="text-lg font-extrabold text-amber-600">{score}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        {!finished ? (
          <>
            {/* Sound display */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 mb-5">
              {showSound ? (
                <>
                  <div className="text-4xl font-black text-orange-600 mb-2 tracking-wider animate-pulse">
                    {target.onomatopoeia}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">"{target.sound}"</p>
                  <button
                    onClick={() => speak(target.sound)}
                    className="mt-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-sm px-4 py-2 rounded-xl transition inline-flex items-center gap-2"
                  >
                    <i className="fa-solid fa-volume-high"></i> Réécouter
                  </button>
                </>
              ) : (
                <div className="text-3xl text-slate-400 animate-pulse">🔊 ...</div>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 py-2.5 px-4 rounded-xl font-bold text-sm ${
                feedback === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedback === 'correct'
                  ? `✅ Oui ! C'est le ${target.emoji} ${target.label} !`
                  : `❌ Non ! C'était le ${target.emoji} ${target.label}`}
              </div>
            )}

            {/* Animal choices */}
            <div className="grid grid-cols-2 gap-3">
              {choices.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleChoice(s.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-300 transition-all hover:scale-[1.03] active:scale-95"
                >
                  <span className="text-5xl">{s.emoji}</span>
                  <span className="text-sm font-bold text-slate-700">{s.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-extrabold text-orange-700 mb-2">Oreilles d'or !</h3>
            <p className="text-slate-600 mb-1">Tu reconnais bien tous les sons !</p>
            <p className="text-xl font-bold text-amber-600">Score : {score} / {TOTAL_ROUNDS * 10} pts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundGame;

