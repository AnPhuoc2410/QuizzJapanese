import { SETTINGS } from "../settings";
import { Example, Word } from "../types";


export interface QuizState {
    index: number;
    input: string;
    message: string;
    meaning: string | null;
    onyomi: string;
    kunyomi: string;
    kanjiAnimation: string[];
    kanjiVideo: string | null;
    example: Example | null;
    timerEnabled: boolean;
    timeLeft: number;
    timerActive: boolean;
    timerPaused: boolean;
    reviewTime: number;
    showingAnswer: boolean;
    reviewCountdown: number;
    wrongWords: Word[];
}

type QuizAction =
    | { type: "NEXT_WORD"; payload: number } // payload: total words count
    | { type: "PREV_WORD"; payload: number }
    | { type: "SET_INPUT"; payload: string }
    | { type: "SET_MESSAGE"; payload: string }
    | { type: "SET_MEANING"; payload: string | null }
    | {
        type: "SET_KANJI_DETAILS"; payload: {
            onyomi: string;
            kunyomi: string;
            kanjiAnimation: string[];
            kanjiVideo: string | null;
            example: Example | null;
        }
    }
    | { type: "TOGGLE_TIMER"; payload: boolean }
    | { type: "UPDATE_TIMER"; payload: number }
    | { type: "RESET_TIMER" }
    | { type: "SET_TIMER_ACTIVE"; payload: boolean }
    | { type: "SET_TIMER_PAUSED"; payload: boolean }
    | { type: "SET_REVIEW_COUNTDOWN"; payload: number }
    | { type: "SET_SHOWING_ANSWER"; payload: boolean }
    | { type: "RESET_STATE" }
    | { type: "ADD_WRONG_WORD"; payload: Word }
    | { type: "CLEAR_WRONG_WORDS" };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
        case "NEXT_WORD":
            return {
                ...state,
                index: (state.index + 1) % action.payload,
                input: "",
                message: "",
                meaning: null,
                onyomi: "",
                kunyomi: "",
                kanjiAnimation: [],
                kanjiVideo: null,
                example: null,
                timeLeft: SETTINGS.COUNTDOWN_TIME_LEFT,
                showingAnswer: false,
            };
        case "PREV_WORD":
            return {
                ...state,
                index: (state.index - 1 + action.payload) % action.payload,
                input: "",
                message: "",
                meaning: null,
                onyomi: "",
                kunyomi: "",
                kanjiAnimation: [],
                kanjiVideo: null,
                example: null,
                timeLeft: SETTINGS.COUNTDOWN_TIME_LEFT,
                showingAnswer: false,
            };
        case "SET_INPUT":
            return { ...state, input: action.payload };
        case "SET_MESSAGE":
            return { ...state, message: action.payload };
        case "SET_MEANING":
            return { ...state, meaning: action.payload };
        case "SET_KANJI_DETAILS":
            return {
                ...state,
                onyomi: action.payload.onyomi,
                kunyomi: action.payload.kunyomi,
                kanjiAnimation: action.payload.kanjiAnimation,
                kanjiVideo: action.payload.kanjiVideo,
                example: action.payload.example,
            };
        case "TOGGLE_TIMER":
            return { ...state, timerEnabled: action.payload };
        case "UPDATE_TIMER":
            return { ...state, timeLeft: action.payload };
        case "RESET_TIMER":
            return { ...state, timeLeft: SETTINGS.COUNTDOWN_TIME_LEFT };
        case "SET_TIMER_ACTIVE":
            return { ...state, timerActive: action.payload };
        case "SET_TIMER_PAUSED":
            return { ...state, timerPaused: action.payload };
        case "SET_REVIEW_COUNTDOWN":
            return { ...state, reviewCountdown: action.payload };
        case "SET_SHOWING_ANSWER":
            return { ...state, showingAnswer: action.payload };
        case "RESET_STATE":
            return {
                ...state,
                input: "",
                message: "",
                meaning: null,
                onyomi: "",
                kunyomi: "",
                kanjiAnimation: [],
                kanjiVideo: null,
                example: null,
            };
        case "ADD_WRONG_WORD":
            if (state.wrongWords.find((w) => w.kanji === action.payload.kanji)) {
                return state;
            }
            return { ...state, wrongWords: [...state.wrongWords, action.payload] };
        case "CLEAR_WRONG_WORDS":
            return { ...state, wrongWords: [] };
        default:
            return state;
    }
}
