import { Word } from "../types";
import { KanjiData } from "../types";
import { ENV } from "../envs";

export const shuffle = (array: Word[]) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};

export const fetchListWordInSheet = async (): Promise<Word[]> => {
  const url = ENV.API_SHEET_URL;

  if (!url) {
    throw new Error("VITE_API_SHEET environment variable is not defined");
  }

  try {
    const response = await fetch(url);
    const text = await response.text();

    const rows = text
      .split("\n")
      .map((row) =>
        row.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim())
      )
      .filter((row) => row.length > 2 && row[1] && row[2]);
    if (rows.length <= 1) {
      throw new Error("No words found in the sheet");
    }

    return rows.slice(1).map((row) => ({
      kanji: row[1],
      hiragana: row[2],
      meaning: row[3] || "N/A",
    }));
  } catch (error) {
    console.log("Error fetching list word in sheet: ", error);
    throw error;
  }
};

export const fetchKanji = async (kanji: string): Promise<KanjiData> => {
  return await fetch(`https://${ENV.API_HOST}/api/public/kanji/${kanji}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": ENV.API_HOST || "",
      "X-RapidAPI-Key": ENV.API_KEY || "",
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching kanji data: ", error);
    });
};
