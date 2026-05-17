import { useEffect, useMemo, useRef, useState } from 'react';
import { FacadeScene } from './components/FacadeScene';
import { quizSongs, totalQuizStops } from './data/quizConfig';

type GameState = 'idle' | 'playing' | 'question' | 'finished';
type ShareStatus = 'idle' | 'copied' | 'shared' | 'error';
type Locale = 'en' | 'es' | 'fr';

const translations = {
  en: {
    audioBlocked: 'The browser blocked audio playback. Tap start again to begin the experience.',
    audioResumeError: 'Audio could not resume. Tap Start the experience to restart.',
    audioNextError: 'Audio could not continue to the next song. Tap Start the experience to restart.',
    challenge: 'La Casita lyric challenge',
    copied: 'Copied score text.',
    correct: 'Correct. Back to the song.',
    finalScore: 'Final score',
    guess: 'Guess the next line',
    lyricQuestion: 'Lyric question',
    pause: 'Pause',
    play: 'Play',
    playAgain: 'Play again',
    prompt: 'Prompt',
    question: 'Question',
    score: 'Score',
    share: 'Share score',
    shareError: 'Could not share or copy.',
    shared: 'Shared.',
    song: 'Song',
    start: 'Start the experience',
    startCopy: (total: number) => `Start the track, answer ${total} timed prompts, and see your final score.`,
    time: 'Time',
    wrong: 'Not this one. Back to the song.',
  },
  es: {
    audioBlocked: 'El navegador bloqueó el audio. Toca iniciar otra vez para comenzar.',
    audioResumeError: 'No se pudo reanudar el audio. Toca Iniciar la experiencia para reiniciar.',
    audioNextError: 'No se pudo continuar con la siguiente canción. Toca Iniciar la experiencia para reiniciar.',
    challenge: 'Reto de letras de La Casita',
    copied: 'Texto del puntaje copiado.',
    correct: 'Correcto. Volvemos a la canción.',
    finalScore: 'Puntaje final',
    guess: 'Adivina la siguiente línea',
    lyricQuestion: 'Pregunta de letra',
    pause: 'Pausar',
    play: 'Reproducir',
    playAgain: 'Jugar de nuevo',
    prompt: 'Pregunta',
    question: 'Pregunta',
    score: 'Puntaje',
    share: 'Compartir puntaje',
    shareError: 'No se pudo compartir ni copiar.',
    shared: 'Compartido.',
    song: 'Canción',
    start: 'Iniciar la experiencia',
    startCopy: (total: number) => `Inicia la canción, responde ${total} preguntas sincronizadas y mira tu puntaje final.`,
    time: 'Tiempo',
    wrong: 'No era esa. Volvemos a la canción.',
  },
  fr: {
    audioBlocked: 'Le navigateur a bloqué le son. Appuie de nouveau sur démarrer pour commencer.',
    audioResumeError: 'Impossible de relancer le son. Appuie sur Démarrer l’expérience pour recommencer.',
    audioNextError: 'Impossible de passer au morceau suivant. Appuie sur Démarrer l’expérience pour recommencer.',
    challenge: 'Défi paroles de La Casita',
    copied: 'Texte du score copié.',
    correct: 'Correct. Retour à la chanson.',
    finalScore: 'Score final',
    guess: 'Devine la ligne suivante',
    lyricQuestion: 'Question paroles',
    pause: 'Pause',
    play: 'Lire',
    playAgain: 'Rejouer',
    prompt: 'Question',
    question: 'Question',
    score: 'Score',
    share: 'Partager le score',
    shareError: 'Impossible de partager ou copier.',
    shared: 'Partagé.',
    song: 'Chanson',
    start: 'Démarrer l’expérience',
    startCopy: (total: number) => `Lance le morceau, réponds à ${total} questions synchronisées, puis découvre ton score final.`,
    time: 'Temps',
    wrong: 'Ce n’est pas celle-ci. Retour à la chanson.',
  },
} satisfies Record<Locale, Record<string, string | ((total: number) => string)>>;

function getLocale(): Locale {
  const requestedLocale = new URLSearchParams(window.location.search).get('lang')?.toLowerCase();
  return requestedLocale === 'es' || requestedLocale === 'fr' || requestedLocale === 'en' ? requestedLocale : 'en';
}

function formatPlaybackTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${minutes}:${remainingSeconds} (${seconds.toFixed(1)}s)`;
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [songIndex, setSongIndex] = useState(0);
  const [stopIndex, setStopIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  const locale = getLocale();
  const t = translations[locale];
  const activeSong = quizSongs[songIndex];
  const activeQuestion = activeSong?.stops[stopIndex];
  const totalQuestions = totalQuizStops;
  const controlsFrozen = gameState === 'question';
  const songIsPlaying = gameState === 'playing' && !isManuallyPaused;
  const resultText = useMemo(() => {
    if (locale === 'es') return `Logré ${score}/${totalQuestions} en el reto de letras DtMF La Casita`;
    if (locale === 'fr') return `J’ai marqué ${score}/${totalQuestions} au défi paroles DtMF La Casita`;
    return `I scored ${score}/${totalQuestions} in the DtMF La Casita lyric challenge`;
  }, [locale, score, totalQuestions]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || isManuallyPaused) return;

    let frameId = 0;
    const checkQuestionTime = () => {
      const audio = audioRef.current;
      if (audio) setPlaybackTime(audio.currentTime);

      if (audio && activeQuestion && audio.currentTime >= activeQuestion.timestamp) {
        audio.pause();
        setSelectedAnswer(null);
        setGameState('question');
        return;
      }

      frameId = window.requestAnimationFrame(checkQuestionTime);
    };

    frameId = window.requestAnimationFrame(checkQuestionTime);
    return () => window.cancelAnimationFrame(frameId);
  }, [activeQuestion, gameState, isManuallyPaused]);

  const playSong = async (nextSongIndex: number, startTime = 0) => {
    const audio = audioRef.current;
    const song = quizSongs[nextSongIndex];
    if (!audio || !song) return;

    if (audio.src !== song.audioSrc) {
      audio.src = song.audioSrc;
      audio.load();
    }

    audio.currentTime = startTime;
    audio.volume = 0.86;
    await audio.play();
  };

  const startExperience = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    setAudioError(null);
    setShareStatus('idle');
    setSongIndex(0);
    setStopIndex(0);
    setAnsweredCount(0);
    setScore(0);
    setSelectedAnswer(null);
    setPlaybackTime(0);
    setIsManuallyPaused(false);
    setGameState('playing');

    try {
      await playSong(0);
    } catch {
      setGameState('idle');
      setAudioError(t.audioBlocked as string);
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || gameState === 'idle' || gameState === 'finished' || gameState === 'question') return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsManuallyPaused(false);
        setGameState('playing');
      } catch {
        setAudioError(t.audioResumeError as string);
      }
      return;
    }

    audio.pause();
    setPlaybackTime(audio.currentTime);
    setIsManuallyPaused(true);
  };

  const chooseAnswer = (choiceIndex: number) => {
    if (selectedAnswer !== null || !activeQuestion) return;

    const isCorrect = choiceIndex === activeQuestion.correctIndex;
    const nextAnsweredCount = answeredCount + 1;
    setSelectedAnswer(choiceIndex);
    setAnsweredCount(nextAnsweredCount);
    if (isCorrect) setScore((currentScore) => currentScore + 1);

    resumeTimeoutRef.current = window.setTimeout(async () => {
      const nextStopIndex = stopIndex + 1;
      const audio = audioRef.current;

      if (nextAnsweredCount >= totalQuestions) {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        setGameState('finished');
        return;
      }

      setStopIndex(nextStopIndex);
      setSelectedAnswer(null);
      setIsManuallyPaused(false);
      setGameState('playing');

      try {
        await audio?.play();
      } catch {
        setAudioError(t.audioResumeError as string);
        setGameState('idle');
      }
    }, 1050);
  };

  const handleSongEnded = async () => {
    if (gameState !== 'playing') return;

    const nextSongIndex = songIndex + 1;
    if (nextSongIndex >= quizSongs.length) {
      setGameState('finished');
      return;
    }

    setSongIndex(nextSongIndex);
    setStopIndex(0);
    setSelectedAnswer(null);
    setIsManuallyPaused(false);

    try {
      await playSong(nextSongIndex);
    } catch {
      setAudioError(t.audioNextError as string);
      setGameState('idle');
    }
  };

  const shareResult = async () => {
    setShareStatus('idle');

    try {
      if (navigator.share) {
        await navigator.share({
          text: resultText,
          title: 'DtMF La Casita lyric challenge',
        });
        setShareStatus('shared');
        return;
      }

      await navigator.clipboard.writeText(resultText);
      setShareStatus('copied');
    } catch {
      try {
        await navigator.clipboard.writeText(resultText);
        setShareStatus('copied');
      } catch {
        setShareStatus('error');
      }
    }
  };

  const selectedIsCorrect = activeQuestion && selectedAnswer === activeQuestion.correctIndex;
  const activeQuestionNumber = selectedAnswer === null ? answeredCount + 1 : answeredCount;

  return (
    <main className="app-shell">
      <header className="site-header" aria-label="DtMF">
        <div className="site-logo">DtMF</div>
      </header>
      <FacadeScene controlsFrozen={controlsFrozen} singerPerforming={songIsPlaying} />
      <audio ref={audioRef} onEnded={handleSongEnded} preload="auto" />

      {gameState !== 'idle' && gameState !== 'finished' ? (
        <div className="playback-controls" aria-label="Playback controls">
          <button className="icon-action" type="button" onClick={togglePlayback} disabled={gameState === 'question'}>
            {isManuallyPaused ? t.play : t.pause}
          </button>
        </div>
      ) : null}

      <div className="score-dock" aria-live="polite">
        <div className="score-dock-metric">
          <span>{t.score}</span>
          <strong>{score} / {totalQuestions}</strong>
        </div>
        <div className="score-dock-metric score-dock-time">
          <span>{t.time}</span>
          <strong>{formatPlaybackTime(playbackTime)}</strong>
        </div>
      </div>

      {gameState === 'idle' ? (
        <section className="experience-overlay experience-overlay-start" aria-label={t.start as string}>
          <div className="start-panel">
            <span className="eyebrow">{t.challenge}</span>
            <h1>{t.guess}</h1>
            <p>{(t.startCopy as (total: number) => string)(totalQuestions)}</p>
            <button className="primary-action" type="button" onClick={startExperience}>
              {t.start}
            </button>
            {audioError ? <p className="status-message is-error">{audioError}</p> : null}
          </div>
        </section>
      ) : null}

      {gameState === 'playing' ? (
        <div className="game-hud" aria-live="polite">
          <span>{t.prompt} {Math.min(answeredCount + 1, totalQuestions)}/{totalQuestions}</span>
          {activeSong ? <span>{t.song} {activeSong.title}</span> : null}
        </div>
      ) : null}

      {gameState === 'question' && activeQuestion ? (
        <section className="experience-overlay" aria-label={t.lyricQuestion as string}>
          <div className="question-panel">
            <div className="question-meta">
              <span>{t.question} {activeQuestionNumber}/{totalQuestions}</span>
              <span>{t.score} {score}/{totalQuestions}</span>
            </div>
            <div className="choice-grid">
              {activeQuestion.choices.map((choice, choiceIndex) => {
                const isSelected = selectedAnswer === choiceIndex;
                const isCorrectChoice = activeQuestion.correctIndex === choiceIndex;
                const stateClass = selectedAnswer === null
                  ? ''
                  : isCorrectChoice
                    ? 'is-correct'
                    : isSelected
                      ? 'is-wrong'
                      : 'is-muted';

                return (
                  <button
                    className={`choice-button ${stateClass}`}
                    disabled={selectedAnswer !== null}
                    key={choice}
                    onClick={() => chooseAnswer(choiceIndex)}
                    type="button"
                  >
                    <span>{String.fromCharCode(65 + choiceIndex)}</span>
                    {choice}
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null ? (
              <p className={`feedback ${selectedIsCorrect ? 'is-correct' : 'is-wrong'}`}>
                {selectedIsCorrect ? t.correct : t.wrong}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {gameState === 'finished' ? (
        <section className="experience-overlay" aria-label={t.finalScore as string}>
          <div className="result-panel">
            <div className="score-card">
              <span className="score-brand">DtMF</span>
              <p>{t.challenge}</p>
              <strong>{score} / {totalQuestions}</strong>
              <span>{resultText}</span>
            </div>
            <div className="result-actions">
              <button className="primary-action" type="button" onClick={shareResult}>
                {t.share}
              </button>
              <button className="secondary-action" type="button" onClick={startExperience}>
                {t.playAgain}
              </button>
            </div>
            {shareStatus === 'shared' ? <p className="status-message">{t.shared}</p> : null}
            {shareStatus === 'copied' ? <p className="status-message">{t.copied}</p> : null}
            {shareStatus === 'error' ? <p className="status-message is-error">{t.shareError}</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default App;
