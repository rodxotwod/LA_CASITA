import lyricTimelineConfig from './lyricTimeline.json';

type RawLyricEntry = {
  text: string;
  timestamp: number;
};

type RawSongLyrics = {
  lyrics: RawLyricEntry[];
  songId: string;
};

type RawLyricTimeline = {
  songs: RawSongLyrics[];
};

export type LyricEntry = {
  text: string;
  timestamp: number;
};

const lyricSongs = (lyricTimelineConfig as RawLyricTimeline).songs.map((song) => ({
  ...song,
  lyrics: [...song.lyrics]
    .filter((lyric) => lyric.text.trim().length > 0)
    .sort((first, second) => first.timestamp - second.timestamp),
}));

export function getActiveLyric(songId: string | undefined, currentTime: number) {
  const song = lyricSongs.find((candidate) => candidate.songId === songId);
  if (!song) return null;

  return song.lyrics.reduce<LyricEntry | null>((activeLyric, lyric) => {
    if (lyric.timestamp > currentTime) return activeLyric;
    return lyric;
  }, null);
}
