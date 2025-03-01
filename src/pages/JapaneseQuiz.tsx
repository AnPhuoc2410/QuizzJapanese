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
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import TimerIcon from "@mui/icons-material/Timer";
import NavigationButton from "../components/ButtonComponent";
import KanjiDetails from "../components/KanjiDetails";
import { ENV } from "../envs";
import { SETTINGS } from "../settings";
import { KanjiData, Word, WrongModel } from "../types";
import { shuffle, fetchKanji, fetchListWordInSheet } from "../utils";
import { quizReducer, QuizState } from "../types/state";
import WrongWordsModal from "../components/WrongWordsModal";

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

  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [words, setWords] = useState<Word[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerChecked = useRef<boolean>(false);
  const [wrongMode, setWrongMode] = useState<WrongModel>(
    "none" as unknown as WrongModel
  );
  const [openModal, setOpenModal] = useState(false);

  const wrongWords: Word[] = state.wrongWords;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Cache for Kanji API responses
  const [kanjiCache, setKanjiCache] = useState<{ [key: string]: KanjiData }>(
    {}
  );

  // Handle shuffle setting from location state
  const location = useLocation();
  const { isShuffle } = location.state || { isShuffle: false };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["words", ENV.API_SHEET_URL],
    queryFn: fetchListWordInSheet,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const wordsToUse = [...data];
      if (isShuffle) {
        shuffle(wordsToUse);
      }
      setWords(wordsToUse);
    }
  }, [data, isShuffle]);

  useEffect(() => {
    if (
      state.timerEnabled &&
      state.timerActive &&
      !state.timerPaused &&
      !state.showingAnswer
    ) {
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
  }, [
    state.timerEnabled,
    state.timerActive,
    state.timerPaused,
    state.showingAnswer,
    state.timeLeft,
  ]);

  useEffect(() => {
    if (state.showingAnswer) {
      dispatch({ type: "SET_REVIEW_COUNTDOWN", payload: state.reviewTime });
      reviewTimerRef.current = setInterval(() => {
        dispatch({
          type: "SET_REVIEW_COUNTDOWN",
          payload: state.reviewCountdown - 1,
        });
        if (state.reviewCountdown <= 1) {
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
  }, [state.showingAnswer, state.reviewCountdown, state.reviewTime]);

  const startReviewPeriod = useCallback(() => {
    dispatch({ type: "SET_SHOWING_ANSWER", payload: true });
  }, []);

  const fetchKanjiDetails = useCallback(
    async (kanji: string) => {
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
    },
    [kanjiCache]
  );

  const handleWrongModeChange = (event: SelectChangeEvent<WrongModel>) => {
    const mode = event.target.value;
    setWrongMode(mode as WrongModel);

    if (mode === "review") {
      setOpenModal(true);
    } else if (mode === "practice") {
      // LÀM GÌ Ở ĐÂY ĐỂ KIỂM TRA LẠI TỪ SAI MÀ LƯỜI LÀM
      if (wrongWords.length > 0) {
        alert("CHƯA CÓ CHỨC NĂNG PRACTICE TỪ SAI :))");
        // LÀM VÔ ĐÂY MỘT TRANG MỚI CHẢ HẠN
      } else {
        alert("Bạn chưa có từ sai nào để luyện tập!");
      }
      setWrongMode("none" as unknown as WrongModel);
    }
  };

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

  const checkAnswer = useCallback(() => {
    if (!words || words.length === 0) return;
    answerChecked.current = true;
    dispatch({ type: "SET_TIMER_ACTIVE", payload: false });
    const currentWord = words[state.index];
    if (!currentWord) return;

    if (state.input.trim() === currentWord.hiragana) {
      dispatch({ type: "SET_MESSAGE", payload: "✅ Đúng!" });
    } else {
      dispatch({
        type: "SET_MESSAGE",
        payload: `❌ Sai! Đáp án: ${currentWord.hiragana}`,
      });
      dispatch({ type: "ADD_WRONG_WORD", payload: currentWord });
    }
    dispatch({ type: "SET_MEANING", payload: currentWord.meaning });
    fetchKanjiDetails(currentWord.kanji);
  }, [words, state.index, state.input, fetchKanjiDetails]);

  const nextWord = useCallback(() => {
    if (!words || words.length === 0) return;
    answerChecked.current = false;
    dispatch({ type: "NEXT_WORD", payload: words.length });
    if (state.timerEnabled) {
      dispatch({ type: "SET_TIMER_ACTIVE", payload: true });
      dispatch({ type: "SET_TIMER_PAUSED", payload: false });
    }
  }, [words, state.timerEnabled]);

  const prevWord = useCallback(() => {
    if (!words || words.length === 0) return;
    answerChecked.current = false;
    dispatch({ type: "PREV_WORD", payload: words.length });
    dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
    if (state.timerEnabled) {
      dispatch({ type: "SET_TIMER_ACTIVE", payload: true });
      dispatch({ type: "SET_TIMER_PAUSED", payload: false });
    }
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
  }, [words, state.timerEnabled]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !state.showingAnswer) {
      checkAnswer();
    }
  };

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

  const togglePause = useCallback(() => {
    dispatch({ type: "SET_TIMER_PAUSED", payload: !state.timerPaused });
  }, [state.timerPaused]);

  const handleReviewTimeChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    dispatch({ type: "SET_REVIEW_COUNTDOWN", payload: value });
    dispatch({ type: "SET_SHOWING_ANSWER", payload: false });
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
  };

  const timerProgress = (state.timeLeft / SETTINGS.COUNTDOWN_TIME_LEFT) * 100;
  const reviewProgress = (state.reviewCountdown / state.reviewTime) * 100;

  // RENDER ここ
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
      {isError ? (
        <Typography color="error" textAlign="center">
          Error: {error?.message || "Failed to load words"}
        </Typography>
      ) : isLoading || isFetching ? (
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
      ) : !data || data.length === 0 || !words || words.length === 0 ? (
        <Typography variant="h5" textAlign="center">
          Không có dữ liệu từ vựng. Hãy kiểm tra lại URL hoặc liên hệ với người
          quản trị.
        </Typography>
      ) : (
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            p: 0,
          }}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 0,
            }}
          >
            <Typography variant="subtitle1">
              Thẻ {state.index + 1} trong {words.length}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <FormControl variant="outlined" size="small">
                <InputLabel id="wrong-mode-label">Danh sách</InputLabel>
                <Select
                  labelId="wrong-mode-label"
                  value={wrongMode}
                  onChange={handleWrongModeChange}
                  label="Wrong Words"
                >
                  <MenuItem value="none">Thêm</MenuItem>
                  <MenuItem value="review">Xem Lại</MenuItem>
                  <MenuItem value="practice">Luyện Tập</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.timerEnabled}
                    onChange={toggleTimer}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TimerIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body1">Đếm ngược thời gian</Typography>
                  </Box>
                }
                labelPlacement="start"
              />

              {state.timerEnabled && (
                <>
                  <IconButton
                    onClick={togglePause}
                    color="primary"
                    disabled={
                      !state.timerActive ||
                      state.timeLeft === 0 ||
                      state.showingAnswer
                    }
                  >
                    {state.timerPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  </IconButton>

                  <Tooltip title="Review time settings">
                    <IconButton
                      onClick={() => {
                        const element =
                          document.getElementById("review-time-slider");
                        if (element) {
                          element.style.display =
                            element.style.display === "none" ? "block" : "none";
                        }
                      }}
                      color="primary"
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {state.timerEnabled && (
            <Box
              id="review-time-slider"
              sx={{
                px: 3,
                pt: 2,
                pb: 2,
                display: "none",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" gutterBottom>
                Thời gian xem lại: {state.reviewTime} giây
              </Typography>
              <Slider
                value={state.reviewTime}
                onChange={handleReviewTimeChange}
                min={3}
                max={15}
                step={1}
                marks
                valueLabelDisplay="auto"
                aria-labelledby="review-time-slider"
              />
            </Box>
          )}

          {state.timerEnabled && (
            <Box sx={{ px: 3, pt: 1, pb: 0 }}>
              {state.showingAnswer ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="secondary.main"
                      fontWeight="bold"
                    >
                      Xem Lại:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="secondary.main"
                      fontWeight="bold"
                    >
                      {state.reviewCountdown} giây
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={reviewProgress}
                    color="secondary"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Thời Gian Còn Lại:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {state.timeLeft} giây
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={timerProgress}
                    color={state.timeLeft < 10 ? "error" : "primary"}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                      },
                    }}
                  />
                </>
              )}
            </Box>
          )}

          <CardContent sx={{ p: isMobile ? 2 : 4 }}>
            {state.showingAnswer && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "#fff8e1",
                  borderRadius: 2,
                  border: "1px solid #ffe082",
                }}
              >
                <Typography variant="body1" color="secondary">
                  Thời gian xem: Chuyển sang thẻ tiếp theo trong{" "}
                  {state.reviewCountdown} giây...
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: isMobile ? 2 : 4, mt: isMobile ? 1 : 2 }}>
              <Typography
                variant="h1"
                sx={{
                  textAlign: "center",
                  fontSize: isMobile ? "clamp(1.5rem, 5vw, 2.5rem)" : "7rem",
                  lineHeight: 1.2,
                  mb: isMobile ? 2 : 3,
                }}
              >
                {words[state.index].kanji}
              </Typography>

              <KanjiDetails
                meaning={state.meaning}
                onyomi={state.onyomi}
                kunyomi={state.kunyomi}
                kanjiAnimation={state.kanjiAnimation}
                kanjiVideo={state.kanjiVideo}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </Box>

            <TextField
              label="Nhập Hiragana"
              variant="outlined"
              value={state.input}
              onChange={(e) =>
                dispatch({ type: "SET_INPUT", payload: e.target.value })
              }
              onKeyPress={handleKeyPress}
              fullWidth
              disabled={state.timeLeft === 0 || state.showingAnswer}
              InputProps={{
                style: { fontSize: "1.2rem" },
              }}
              InputLabelProps={{
                style: { fontSize: "1.2rem" },
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  height: isMobile ? 56 : 64,
                },
              }}
            />

            <Typography
              variant="h5"
              color={
                state.message.includes("✅") ? "success.main" : "error.main"
              }
              sx={{
                textAlign: "center",
                marginBottom: isMobile ? 2 : 1,
                height: 40,
                fontWeight: "bold",
                fontSize: isMobile ? "1rem" : "1.5rem",
              }}
            >
              {state.message}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                // flexDirection: isMobile ? "column" : "row",
              }}
            >
              <NavigationButton
                type="prev"
                onClick={prevWord}
                isMobile={isMobile}
              />
              <NavigationButton
                type="check"
                onClick={checkAnswer}
                disabled={state.timeLeft === 0 || state.showingAnswer}
                isMobile={isMobile}
              />
              <NavigationButton
                type="next"
                onClick={nextWord}
                isMobile={isMobile}
              />
            </Box>
          </CardContent>
        </Paper>
      )}

      <WrongWordsModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setWrongMode("none" as unknown as WrongModel);
        }}
        wrongWords={wrongWords}
      />
      <Typography variant="body2" color="white" align="center" p={2}>
        © 2025 From Trieu先生 with ❤️. All rights reserved.
      </Typography>
    </Container>
  );
};

export default JapaneseQuiz;
