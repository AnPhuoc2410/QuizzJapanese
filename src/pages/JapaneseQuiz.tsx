import React, {
  useEffect,
  useReducer,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  SelectChangeEvent,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import QuizHeader from "../components/quiz/QuizHeader";
import QuizCard from "../components/quiz/QuizCard";
import TimerComponent from "../components/quiz/TimerComponent";
import WrongWordsModal from "../components/WrongWordsModal";

import { ENV } from "../envs";
import { SETTINGS } from "../settings";
import { KanjiData, Word, WrongModel } from "../types";
import { shuffle, fetchKanji, fetchListWordInSheet } from "../utils";
import { quizReducer, QuizState } from "../types/state";

const JapaneseQuiz: React.FC = () => {
  const initialState: QuizState = {
    index: 0,
    input: "",
    message: "",
    meaning: null,
    onyomi: "",
    kunyomi: "",
    kanjiAnimation: [],
    kanjiVideo: null,
    example: null,
    timerEnabled: false,
    timeLeft: SETTINGS.COUNTDOWN_TIME_LEFT,
    timerActive: false,
    timerPaused: false,
    reviewTime: SETTINGS.REVIEW_TIME_EACH_QUESTION,
    showingAnswer: false,
    reviewCountdown: 0,
    wrongWords: [],
  };

  const [countdown, setCountdown] = useState<number | null>(null);
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [words, setWords] = useState<Word[]>([]);
  const [isWrongWordsPracticeMode, setIsWrongWordsPracticeMode] = useState<boolean>(false);
  const [currentWordList, setCurrentWordList] = useState<Word[]>([]);
  const [normalModeIndex, setNormalModeIndex] = useState<number>(0); // Store normal mode index
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerChecked = useRef<boolean>(false);
  const [wrongMode, setWrongMode] = useState<WrongModel>("none" as unknown as WrongModel);
  const [openModal, setOpenModal] = useState(false);

  const wrongWords: Word[] = state.wrongWords;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Cache for Kanji API responses
  const [kanjiCache, setKanjiCache] = useState<{ [key: string]: KanjiData }>({});

  // Handle shuffle setting from location state
  const location = useLocation();
  const {
    numberRange = 1,
    isShuffle = false,
    isShuffleCustom = false,
    autoNext = false,
  } = location.state || {};

  // Fetch words data
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["words", ENV.API_SHEET_URL],
    queryFn: fetchListWordInSheet,
  });

  // Process words data
  useEffect(() => {
    if (data && data.length > 0) {
      let wordsToUse = [...data];

      // Define the array ranges based on numberRange value
      if (numberRange === 1) {
        wordsToUse = wordsToUse.slice(0, 150);
      } else if (numberRange === 2) {
        wordsToUse = wordsToUse.slice(150, 300);
      } else if (numberRange === 3) {
        wordsToUse = wordsToUse.slice(300, 451);
      }

      // Shuffle if isShuffle or isShuffleCustom is true
      if (isShuffle || isShuffleCustom) {
        shuffle(wordsToUse);
      }

      setWords(wordsToUse);
    }
  }, [data, numberRange, isShuffle, isShuffleCustom]);

  // Timer management
  useEffect(() => {
    if (state.timerEnabled && state.timerActive && !state.timerPaused && !state.showingAnswer) {
      timerRef.current = setInterval(() => {
        dispatch({ type: "UPDATE_TIMER", payload: state.timeLeft - 1 });
        if (state.timeLeft <= 1) {
          if (!answerChecked.current) {
            checkAnswer();
          }
          startReviewPeriod();
          clearInterval(timerRef.current as NodeJS.Timeout);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.timerEnabled, state.timerActive, state.timerPaused, state.showingAnswer, state.timeLeft]);

  // Review timer management
  useEffect(() => {
    if (state.showingAnswer) {
      let counter = state.reviewTime;
      dispatch({ type: "SET_REVIEW_COUNTDOWN", payload: counter });

      reviewTimerRef.current = setInterval(() => {
        counter -= 1;
        dispatch({ type: "SET_REVIEW_COUNTDOWN", payload: counter });

        if (counter <= 0) {
          clearInterval(reviewTimerRef.current as NodeJS.Timeout);
          dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
          nextWord();
        }
      }, 1000);
    } else if (reviewTimerRef.current) {
      clearInterval(reviewTimerRef.current);
    }
    return () => {
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    };
  }, [state.showingAnswer, state.reviewTime]);

  // Set current word list based on practice mode
  useEffect(() => {
    if (isWrongWordsPracticeMode && wrongWords.length > 0) {
      setCurrentWordList([...wrongWords]);
    } else {
      setCurrentWordList(words);
    }
  }, [isWrongWordsPracticeMode, words, wrongWords]);

  // Start review period
  const startReviewPeriod = useCallback(() => {
    dispatch({ type: "SET_SHOWING_ANSWER", payload: true });
  }, []);

  // Fetch kanji details from API or cache
  const fetchKanjiDetails = useCallback(async (kanji: string) => {
    if (kanjiCache[kanji]) {
      console.log("Returning cached data for:", kanji);
      updateKanjiState(kanjiCache[kanji]);
      return;
    }
    try {
      const data = await fetchKanji(kanji);
      console.log("Kanji API Response:", data);
      setKanjiCache((prev) => ({ ...prev, [kanji]: data }));
      updateKanjiState(data);
    } catch (error) {
      console.error("Error fetching Kanji details:", error);
      dispatch({
        type: "SET_KANJI_DETAILS",
        payload: {
          onyomi: "",
          kunyomi: "",
          kanjiAnimation: [],
          kanjiVideo: null,
          example: null,
        },
      });
    }
  }, [kanjiCache]);

  // Handle wrong mode changes
  const handleWrongModeChange = (event: SelectChangeEvent<WrongModel>) => {
    const mode = event.target.value;
    setWrongMode(mode as WrongModel);

    if (mode === "review") {
      setOpenModal(true);
    } else if (mode === "practice") {
      if (wrongWords.length > 0) {
        startWrongWordsPractice();
      } else {
        alert("Bạn chưa có từ sai nào để luyện tập!");
      }
      setWrongMode("none" as unknown as WrongModel);
    }
  };

  // Start practice with wrong words
  const startWrongWordsPractice = useCallback(() => {
    if (wrongWords.length > 0) {
      // Save the current normal mode index before switching
      setNormalModeIndex(state.index);
      
      setIsWrongWordsPracticeMode(true);
      dispatch({ type: "RESET_STATE" });
      dispatch({ type: "NEXT_WORD", payload: wrongWords.length });
      alert(`Bắt đầu luyện tập ${wrongWords.length} từ sai`);
    } else {
      alert("Không có từ sai nào để luyện tập!");
    }
  }, [wrongWords, state.index]);

  // Exit practice mode
  const exitPracticeMode = useCallback(() => {
    setIsWrongWordsPracticeMode(false);
    // Restore the saved normal mode index when returning to normal mode
    dispatch({ type: "SET_INDEX", payload: normalModeIndex });
  }, [normalModeIndex]);

  // Update kanji details in state
  const updateKanjiState = useCallback((data: KanjiData) => {
    dispatch({
      type: "SET_KANJI_DETAILS",
      payload: {
        onyomi: data.kanji?.onyomi?.katakana || "N/A",
        kunyomi: data.kanji?.kunyomi?.hiragana || "N/A",
        kanjiAnimation: data.radical?.animation || [],
        kanjiVideo: data.kanji?.video.webm || null,
        example:
          data.examples && data.examples[0]
            ? {
                japanese: data.examples[0].japanese,
                meaning: data.examples[0].meaning,
                audio: {
                  opus: data.examples[0].audio?.opus || "",
                  aac: data.examples[0].audio?.aac || "",
                  ogg: data.examples[0].audio?.ogg || "",
                  mp3: data.examples[0].audio?.mp3 || "",
                },
              }
            : null,
      },
    });
  }, []);

  // Navigate to the next word
  const nextWord = useCallback(() => {
    const wordsToUse = isWrongWordsPracticeMode ? wrongWords : words;
    if (!wordsToUse || wordsToUse.length === 0) return;
    answerChecked.current = false;
    dispatch({ type: "NEXT_WORD", payload: wordsToUse.length });
    if (state.timerEnabled) {
      dispatch({ type: "SET_TIMER_ACTIVE", payload: true });
      dispatch({ type: "SET_TIMER_PAUSED", payload: false });
    }
  }, [words, wrongWords, isWrongWordsPracticeMode, state.timerEnabled]);

  // Check the user's answer
  const checkAnswer = useCallback(() => {
    const wordsToUse = isWrongWordsPracticeMode ? wrongWords : words;
    if (!wordsToUse || wordsToUse.length === 0) return;
    answerChecked.current = true;
    dispatch({ type: "SET_TIMER_ACTIVE", payload: false });
    const currentWord = wordsToUse[state.index];
    if (!currentWord) return;

    if (state.input.trim() === currentWord.hiragana) {
      dispatch({ type: "SET_MESSAGE", payload: "✅ Đúng!" });
      if (autoNext) {
        setCountdown(2); // Start countdown from 2 seconds
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdownInterval);
              nextWord();
              return null;
            }
            return prev! - 1;
          });
        }, 1000);
      }
    } else {
      dispatch({
        type: "SET_MESSAGE",
        payload: `❌ Sai! Đáp án: ${currentWord.hiragana}`,
      });
      // Only add to wrong words if we're not already in practice mode
      if (!isWrongWordsPracticeMode) {
        dispatch({ type: "ADD_WRONG_WORD", payload: currentWord });
      }
    }
    dispatch({ type: "SET_MEANING", payload: currentWord.meaning });
    fetchKanjiDetails(currentWord.kanji);
  }, [words, wrongWords, isWrongWordsPracticeMode, state.index, state.input, fetchKanjiDetails, nextWord, autoNext]);

  // Navigate to the previous word
  const prevWord = useCallback(() => {
    const wordsToUse = isWrongWordsPracticeMode ? wrongWords : words;
    if (!wordsToUse || wordsToUse.length === 0) return;
    answerChecked.current = false;
    dispatch({ type: "PREV_WORD", payload: wordsToUse.length });
    dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
    if (state.timerEnabled) {
      dispatch({ type: "SET_TIMER_ACTIVE", payload: true });
      dispatch({ type: "SET_TIMER_PAUSED", payload: false });
    }
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
  }, [words, wrongWords, isWrongWordsPracticeMode, state.timerEnabled]);

  // Handle key press (e.g., Enter to check answer)
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !state.showingAnswer) {
      checkAnswer();
    }
  };

  // Toggle timer on/off
  const toggleTimer = useCallback(() => {
    dispatch({ type: "TOGGLE_TIMER", payload: !state.timerEnabled });
    if (!state.timerEnabled) {
      dispatch({ type: "UPDATE_TIMER", payload: SETTINGS.COUNTDOWN_TIME_LEFT });
      dispatch({ type: "SET_TIMER_ACTIVE", payload: true });
      dispatch({ type: "SET_TIMER_PAUSED", payload: false });
    } else {
      dispatch({ type: "SET_TIMER_ACTIVE", payload: false });
      dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
      if (timerRef.current) clearInterval(timerRef.current);
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    }
  }, [state.timerEnabled]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    dispatch({ type: "SET_TIMER_PAUSED", payload: !state.timerPaused });
  }, [state.timerPaused]);

  // Handle review time slider change
  const handleReviewTimeChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    dispatch({ type: "SET_REVIEW_COUNTDOWN", payload: value });
    dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    dispatch({ type: "SET_INPUT", payload: value });
  };

  // Get current word for display
  const getCurrentWord = useCallback(() => {
    const wordsToUse = isWrongWordsPracticeMode ? wrongWords : words;
    return wordsToUse && wordsToUse.length > 0 ? wordsToUse[state.index] : null;
  }, [isWrongWordsPracticeMode, wrongWords, words, state.index]);

  // RENDER
  if (isError) {
    return (
      <Typography color="error" textAlign="center">
        Error: {error?.message || "Failed to load words"}
      </Typography>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="inherit" />
      </Container>
    );
  }

  if (!data || data.length === 0 || !words || words.length === 0) {
    return (
      <Typography variant="h5" textAlign="center">
        Không có dữ liệu từ vựng. Hãy kiểm tra lại URL hoặc liên hệ với người
        quản trị.
      </Typography>
    );
  }

  const currentWord = getCurrentWord();
  const wordListCount = isWrongWordsPracticeMode ? wrongWords.length : words.length;

  return (
    <Container
      maxWidth={isMobile ? "sm" : "md"}
      sx={{
        py: 4,
        px: isMobile ? 1 : 3,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          p: 0,
        }}
      >
        {/* Quiz header with navigation info and wrong words manager */}
        <QuizHeader
          currentIndex={state.index}
          totalCount={wordListCount}
          isWrongWordsPracticeMode={isWrongWordsPracticeMode}
          wrongMode={wrongMode}
          wrongWords={wrongWords}
          isMobile={isMobile}
          onWrongModeChange={handleWrongModeChange}
          onExitPracticeMode={exitPracticeMode}
        />

        {/* Timer component */}
        <TimerComponent
          timerEnabled={state.timerEnabled}
          timerActive={state.timerActive}
          timerPaused={state.timerPaused}
          timeLeft={state.timeLeft}
          maxTime={SETTINGS.COUNTDOWN_TIME_LEFT}
          showingAnswer={state.showingAnswer}
          reviewTime={state.reviewTime}
          reviewCountdown={state.reviewCountdown}
          onToggleTimer={toggleTimer}
          onTogglePause={togglePause}
          onReviewTimeChange={handleReviewTimeChange}
        />

        {/* Main Quiz Card */}
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          <QuizCard
            currentKanji={currentWord?.kanji || ""}
            meaning={state.meaning}
            onyomi={state.onyomi}
            kunyomi={state.kunyomi}
            kanjiAnimation={state.kanjiAnimation}
            kanjiVideo={state.kanjiVideo}
            input={state.input}
            message={state.message}
            showingAnswer={state.showingAnswer}
            timeLeft={state.timeLeft}
            isMobile={isMobile}
            isTablet={isTablet}
            countdown={countdown}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onPrevWord={prevWord}
            onCheckAnswer={checkAnswer}
            onNextWord={nextWord}
          />
        </CardContent>
      </Paper>

      {/* Wrong Words Modal */}
      <WrongWordsModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setWrongMode("none" as unknown as WrongModel);
        }}
        wrongWords={wrongWords}
        onStartPractice={() => {
          setOpenModal(false);
          startWrongWordsPractice();
        }}
      />
      <Typography variant="body2" color="white" align="center" p={2}>
        © 2025 From Trieu先生 with ❤️. All rights reserved.
      </Typography>
    </Container>
  );
};

export default JapaneseQuiz;
