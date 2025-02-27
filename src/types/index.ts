export type KanjiData = {
  kanji: Kanji;
  radical: Radical;
  references: Reference;
  examples: Example[];
};

type Kanji = {
  character: string;
  meaning: {
    english: string;
  };
  strokes: number;
  onyomi: {
    romaji: string;
    katakana: string;
  };
  kunyomi: {
    hiragana: string;
    romaji: string;
  };
  video: {
    poster: string;
    mp4: string;
    webm: string;
  };
};

type Radical = {
  character: string;
  strokes: number;
  image: string;
  position: {
    hiragana: string;
    romaji: string;
    icon: string;
  };
  name: {
    hiragana: string;
    romaji: string;
  };
  meaning: {
    english: string;
  };
  animation: string[];
};

type Reference = {
  grade: number;
  kodansha: string;
  classic_nelson: string;
};

export type Example = {
  japanese: string;
  meaning: {
    english: string;
  };
  audio: {
    opus: string;
    aac: string;
    ogg: string;
    mp3: string;
  };
};

export type Word = {
  kanji: string;
  hiragana: string;
  meaning: string;
};
