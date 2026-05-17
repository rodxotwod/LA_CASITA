import lyricTimelineConfig from './lyricTimeline.json';

type RawLyricEntry = {
  endTimestamp?: number;
  startTimestamp?: number;
  text: string;
  timestamp?: number;
};

type RawSongLyrics = {
  lyrics: RawLyricEntry[];
  songId: string;
};

type RawLyricTimeline = {
  songs: RawSongLyrics[];
};

export type LyricEntry = {
  endTimestamp: number;
  startTimestamp: number;
  text: string;
};

function normalizeLyric(lyric: RawLyricEntry): LyricEntry | null {
  const startTimestamp = lyric.startTimestamp ?? lyric.timestamp;

  if (typeof startTimestamp !== 'number' || typeof lyric.endTimestamp !== 'number') {
    return null;
  }

  if (lyric.endTimestamp <= startTimestamp || lyric.text.trim().length === 0) {
    return null;
  }

  return {
    endTimestamp: lyric.endTimestamp,
    startTimestamp,
    text: lyric.text,
  };
}

const lyricSongs = (lyricTimelineConfig as RawLyricTimeline).songs.map((song) => ({
  ...song,
  lyrics: [...song.lyrics]
    .map(normalizeLyric)
    .filter((lyric): lyric is LyricEntry => lyric !== null)
    .sort((first, second) => first.startTimestamp - second.startTimestamp),
}));

export function getActiveLyric(songId: string | undefined, currentTime: number) {
  const song = lyricSongs.find((candidate) => candidate.songId === songId);
  if (!song) return null;

  return song.lyrics.find((lyric) => currentTime >= lyric.startTimestamp && currentTime <= lyric.endTimestamp) ?? null;
}
