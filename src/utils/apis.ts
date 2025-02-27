import { KanjiData } from "../types";
import { ENV } from "./env";

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
