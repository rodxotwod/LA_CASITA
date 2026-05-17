import quizExperienceConfig from './quizExperience.json';

type RawQuizChoice = string | {
  correct?: boolean;
  text: string;
};

type RawQuizStop = {
  choices: RawQuizChoice[];
  correctIndex?: number;
  id: string;
  prompt: string;
  timestamp: number;
};

type RawQuizSong = {
  artist?: string;
  audioFile: string;
  id: string;
  stops: RawQuizStop[];
  title: string;
};

type RawQuizExperience = {
  songs: RawQuizSong[];
};

export type QuizStop = {
  choices: [string, string, string];
  correctIndex: number;
  id: string;
  prompt: string;
  timestamp: number;
};

export type QuizSong = {
  artist?: string;
  audioFile: string;
  audioSrc: string;
  id: string;
  stops: QuizStop[];
  title: string;
};

function resolveAudioSrc(audioFile: string) {
  return `${import.meta.env.BASE_URL}ASSETS/${encodeURIComponent(audioFile.normalize('NFC'))}`;
}

function normalizeStop(stop: RawQuizStop): QuizStop {
  if (stop.choices.length !== 3) {
    throw new Error(`Quiz stop "${stop.id}" must define exactly 3 choices.`);
  }

  const explicitCorrectChoices = stop.choices.filter((choice) => typeof choice !== 'string' && choice.correct === true);
  if (explicitCorrectChoices.length > 1) {
    throw new Error(`Quiz stop "${stop.id}" can only mark one choice as correct.`);
  }

  const explicitCorrectIndex = stop.choices.findIndex((choice) => typeof choice !== 'string' && choice.correct === true);
  const correctIndex = explicitCorrectIndex >= 0 ? explicitCorrectIndex : stop.correctIndex;
  const choices = stop.choices.map((choice) => (typeof choice === 'string' ? choice : choice.text));

  if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex > 2) {
    throw new Error(`Quiz stop "${stop.id}" must mark one choice with "correct": true or use correctIndex 0, 1, or 2.`);
  }

  return {
    ...stop,
    choices: [choices[0], choices[1], choices[2]],
    correctIndex,
  };
}

function normalizeSong(song: RawQuizSong): QuizSong {
  return {
    ...song,
    audioSrc: resolveAudioSrc(song.audioFile),
    stops: [...song.stops].sort((first, second) => first.timestamp - second.timestamp).map(normalizeStop),
  };
}

export const quizSongs = (quizExperienceConfig as RawQuizExperience).songs.map(normalizeSong);
export const totalQuizStops = quizSongs.reduce((total, song) => total + song.stops.length, 0);
