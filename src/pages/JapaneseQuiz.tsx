import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import TimerIcon from "@mui/icons-material/Timer";
import {
  Box,
  CardContent,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import NavigationButton from "../components/ButtonComponent";
import { SETTINGS } from "../settings";
import { Example, KanjiData, Word } from "../types";
import { fetchKanji } from "../utils/apis";
import { ENV } from "../utils/env";

const JapaneseQuiz: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [onyomi, setOnyomi] = useState<string>("");
  const [kunyomi, setKunyomi] = useState<string>("");
  const [meaning, setMeaning] = useState<string | null>(null);
  const [kanjiAnimation, setKanjiAnimation] = useState<string[]>([]);
  const [kanjiVideo, setKanjiVideo] = useState<string | null>("");
  const [example, setExample] = useState<Example | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Timer related states
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(SETTINGS.TIME_LEFT);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [reviewTime, setReviewTime] = useState<number>(5); // Default 5 seconds review time
  const [showingAnswer, setShowingAnswer] = useState<boolean>(false);
  const [reviewCountdown, setReviewCountdown] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerChecked = useRef<boolean>(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  //cached
  const [kanjiCache, setKanjiCache] = useState<{ [key: string]: KanjiData }>(
    {}
  );

  const fetchGoogleSheet = async () => {
    setLoading(true);
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

      if (rows.length > 1) {
        const formattedWords = rows.slice(1).map((row) => ({
          kanji: row[1],
          hiragana: row[2],
          meaning: row[3] || "N/A",
        }));

        setWords(formattedWords);
      } else {
        console.error("No valid data found in Google Sheet");
      }
    } catch (error) {
      console.error("Error fetching Google Sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheet();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (reviewTimerRef.current) {
        clearInterval(reviewTimerRef.current);
      }
    };
  }, []);

  // Handle timer logic
  useEffect(() => {
    if (timerEnabled && timerActive && !timerPaused && !showingAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up, check answer and start review period
            if (!answerChecked.current) {
              checkAnswer();
            }
            startReviewPeriod();
            clearInterval(timerRef.current as NodeJS.Timeout);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerEnabled, timerActive, timerPaused, showingAnswer]);

  // Handle review period countdown
  useEffect(() => {
    if (showingAnswer) {
      setReviewCountdown(reviewTime);
      reviewTimerRef.current = setInterval(() => {
        setReviewCountdown((prevTime) => {
          if (prevTime <= 1) {
            // Review time over, move to next question
            clearInterval(reviewTimerRef.current as NodeJS.Timeout);
            setShowingAnswer(false);
            nextWord();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (reviewTimerRef.current) {
      clearInterval(reviewTimerRef.current);
    }

    return () => {
      if (reviewTimerRef.current) {
        clearInterval(reviewTimerRef.current);
      }
    };
  }, [showingAnswer]);

  const startReviewPeriod = () => {
    setShowingAnswer(true);
  };

  const fetchKanjiDetails = async (kanji: string) => {
    if (kanjiCache[kanji]) {
      console.log("Returning cached data for:", kanji);
      const data = kanjiCache[kanji];
      updateKanjiState(data);
      return;
    }

    try {
      const data = await fetchKanji(kanji);
      console.log("Kanji API Response:", data);

      // Cache the data in memory
      setKanjiCache((prevCache) => ({
        ...prevCache,
        [kanji]: data,
      }));

      updateKanjiState(data);
    } catch (error) {
      console.error("Error fetching Kanji details:", error);
      setKanjiAnimation([]);
    }
  };

  const updateKanjiState = (data: KanjiData) => {
    setOnyomi(data.kanji?.onyomi?.katakana || "N/A");
    setKunyomi(data.kanji?.kunyomi?.hiragana || "N/A");
    setKanjiAnimation(data.radical?.animation || []);
    setKanjiVideo(data.kanji?.video.webm || "");

    const exampleData = data.examples?.[0];
    if (exampleData) {
      setExample({
        japanese: exampleData.japanese,
        meaning: exampleData.meaning,
        audio: {
          opus: exampleData.audio?.opus || "",
          aac: exampleData.audio?.aac || "",
          ogg: exampleData.audio?.ogg || "",
          mp3: exampleData.audio?.mp3 || "",
        },
      });
    } else {
      setExample(null);
    }
  };

  const checkAnswer = () => {
    if (words.length === 0) return;
    answerChecked.current = true;

    if (timerEnabled) {
      setTimerActive(false);
    }

    if (input.trim() === words[index].hiragana) {
      setMessage("✅ Đúng!");
    } else {
      setMessage(`❌ Sai! Đáp án: ${words[index].hiragana}`);
    }

    // Show meaning after checking
    setMeaning(words[index].meaning);

    // Fetch Kanji details
    fetchKanjiDetails(words[index].kanji);
  };

  const nextWord = () => {
    if (words.length === 0) return;
    answerChecked.current = false;

    setIndex((prev) => (prev + 1) % words.length);
    setInput("");
    setMessage("");
    setMeaning(null);
    setOnyomi("");
    setKunyomi("");
    setKanjiAnimation([]);
    setExample(null);
    setKanjiVideo("");

    // Reset timer
    setTimeLeft(SETTINGS.TIME_LEFT);
    if (timerEnabled) {
      setTimerActive(true);
      setTimerPaused(false);
    }
  };

  const prevWord = () => {
    if (words.length === 0) return;
    answerChecked.current = false;

    setIndex((prev) => (prev - 1 + words.length) % words.length);
    setInput("");
    setMessage("");
    setMeaning(null);
    setOnyomi("");
    setKunyomi("");
    setKanjiAnimation([]);
    setExample(null);
    setKanjiVideo("");

    // Reset timer and cancel any review period
    setTimeLeft(SETTINGS.TIME_LEFT);
    setShowingAnswer(false);
    if (timerEnabled) {
      setTimerActive(true);
      setTimerPaused(false);
    }

    if (reviewTimerRef.current) {
      clearInterval(reviewTimerRef.current);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !showingAnswer) {
      checkAnswer();
    }
  };

  const toggleTimer = () => {
    setTimerEnabled((prev) => !prev);
    if (!timerEnabled) {
      // Turning timer on
      setTimeLeft(SETTINGS.TIME_LEFT);
      setTimerActive(true);
      setTimerPaused(false);
    } else {
      // Turning timer off
      setTimerActive(false);
      setShowingAnswer(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (reviewTimerRef.current) {
        clearInterval(reviewTimerRef.current);
      }
    }
  };

  const togglePause = () => {
    setTimerPaused((prev) => !prev);
  };

  const handleReviewTimeChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    setReviewTime(newValue as number);
  };

  // Calculate progress for the progress bar
  const timerProgress = (timeLeft / SETTINGS.TIME_LEFT) * 100;
  const reviewProgress = (reviewCountdown / reviewTime) * 100;

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
      {loading ? (
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Container>
      ) : words.length > 0 ? (
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
              Card {index + 1} of {words.length}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={timerEnabled}
                    onChange={toggleTimer}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TimerIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body1">Countdown Timer</Typography>
                  </Box>
                }
                labelPlacement="start"
              />

              {timerEnabled && (
                <>
                  <IconButton
                    onClick={togglePause}
                    color="primary"
                    disabled={!timerActive || timeLeft === 0 || showingAnswer}
                  >
                    {timerPaused ? <PlayArrowIcon /> : <PauseIcon />}
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

          {timerEnabled && (
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
                Review time between questions: {reviewTime} seconds
              </Typography>
              <Slider
                value={reviewTime}
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

          {timerEnabled && (
            <Box sx={{ px: 3, pt: 1, pb: 0 }}>
              {showingAnswer ? (
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
                      Review Time:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="secondary.main"
                      fontWeight="bold"
                    >
                      {reviewCountdown} seconds
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
                    <Typography variant="body2">Time Left:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {timeLeft} seconds
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={timerProgress}
                    color={timeLeft < 10 ? "error" : "primary"}
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

          {kanjiVideo && kanjiVideo.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
                mb: 3,
                p: 2,
                bgcolor: "#fff",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              {
                <video
                  key={"video"}
                  src={kanjiVideo}
                  controls
                  autoPlay={true}
                  loop={true}
                  style={{
                    width: isMobile ? 120 : 160,
                    height: isMobile ? 120 : 160,
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              }
            </Box>
          )}

          <CardContent sx={{ p: isMobile ? 2 : 4 }}>
            {showingAnswer && (
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
                  Review time: Moving to next card in {reviewCountdown}{" "}
                  seconds...
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 4, mt: 2 }}>
              <Typography
                variant="h1"
                sx={{
                  textAlign: "center",
                  fontSize: isMobile ? "5rem" : "7rem",
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                {words[index].kanji}
              </Typography>

              {meaning && (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      textAlign: "center",
                      mb: 2,
                      fontWeight: "medium",
                      bgcolor: "#f9f9f9",
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    Ý nghĩa: <strong>{meaning}</strong>
                  </Typography>
                  <Typography
                    sx={{
                      p: 2,
                      gap: 3,
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    Onyomi: <strong>{onyomi}</strong>
                    Kunyomi: <strong>{kunyomi}</strong>
                  </Typography>
                </>
              )}
            </Box>

            {kanjiAnimation.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  mb: 3,
                  p: 2,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                {kanjiAnimation.map((frame, idx) => (
                  <img
                    key={idx}
                    src={frame}
                    alt={`Stroke ${idx}`}
                    style={{
                      width: isMobile ? 60 : 70,
                      height: isMobile ? 60 : 70,
                    }}
                  />
                ))}
              </Box>
            )}

            {example && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "#f0f7ff",
                  borderRadius: 2,
                  border: "1px solid #e6f0ff",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Ví dụ:
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", mb: 1 }}>
                  <strong>{example.japanese}</strong> ({example.meaning.english}
                  )
                </Typography>
                {example.audio && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <audio controls style={{ width: "100%" }}>
                      <source src={example.audio.mp3} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                )}
              </Box>
            )}

            <TextField
              label="Nhập Hiragana"
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              disabled={timeLeft === 0 || showingAnswer}
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
              color={message.includes("✅") ? "success.main" : "error.main"}
              sx={{
                textAlign: "center",
                mb: 3,
                height: 40,
                fontWeight: "bold",
              }}
            >
              {message}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                flexDirection: isMobile ? "column" : "row",
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
                disabled={timeLeft === 0 || showingAnswer}
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
      ) : (
        <Typography variant="h5" textAlign="center">
          No words found. Please check your data source.
        </Typography>
      )}
    </Container>
  );
};

export default JapaneseQuiz;
