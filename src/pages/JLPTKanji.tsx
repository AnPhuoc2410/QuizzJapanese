import React, { useState, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ENV } from "../envs";
import { Word } from "../types";
import QuizHeader from "../components/quiz/QuizHeader";
import QuizCard from "../components/quiz/QuizCard";
import TimerComponent from "../components/quiz/TimerComponent";
import WrongWordsModal from "../components/WrongWordsModal";

const JLPTKanji: React.FC = () => {
  const [jlptLevel, setJlptLevel] = useState<string | null>(null);
  const [jlptData, setJlptData] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  const fetchJLPTData = useCallback(async (level: string) => {
    try {
      const response = await fetch(`${ENV.API_JLPT_URL}?level=${level}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("API response:", data);
        throw new Error("Invalid response format: Expected an array");
      }

      const mappedWords = data.map((item: any) => ({
        kanji: item.word,
        meaning: item.meaning,
        hiragana: item.furigana,
        romaji: item.romaji,
        level: item.level,
      }));

      setJlptData(mappedWords);
    } catch (error: any) {
      console.error("Error fetching JLPT data:", error);
      alert(`Failed to load JLPT data: ${error.message}`);
    }
  }, []);

  const handleJLPTLevelChange = (level: string) => {
    setJlptLevel(level);
    fetchJLPTData(level);
    setIndex(0);
    setInput("");
    setMessage("");
    setShowingAnswer(false);
    setWrongWords([]);
  };

  const currentWord = jlptData[index];

  const checkAnswer = () => {
    if (!currentWord) return;

    // Compare user input with the furigana (hiragana) of the current word
    if (input.trim() === currentWord.hiragana) {
      setMessage("✅ Correct!");
    } else {
      setMessage(`❌ Incorrect! Correct answer: ${currentWord.hiragana}`);
      setWrongWords((prev) => [...prev, currentWord]);
    }
    setShowingAnswer(true);
  };

  const nextWord = () => {
    if (index < jlptData.length - 1) {
      setIndex(index + 1);
      setInput("");
      setMessage("");
      setShowingAnswer(false);
    } else {
      alert("You have completed the quiz!");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        px: 3,
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
        <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="jlpt-level-label">JLPT Level</InputLabel>
        <Select
          labelId="jlpt-level-label"
          value={jlptLevel || ""}
          onChange={(e) => handleJLPTLevelChange(e.target.value)}
          label="JLPT Level"
        >
          <MenuItem value="5">N5</MenuItem>
          <MenuItem value="4">N4</MenuItem>
          <MenuItem value="3">N3</MenuItem>
          <MenuItem value="2">N2</MenuItem>
          <MenuItem value="1">N1</MenuItem>
        </Select>
      </FormControl>

      {jlptData.length > 0 && (
        <Typography variant="body1" gutterBottom>
          {currentWord?.kanji} ({currentWord?.hiragana}): {currentWord?.meaning}
        </Typography>
      )}
        <TimerComponent
          timerEnabled={false}
          timerActive={false}
          timerPaused={false}
          timeLeft={0}
          maxTime={0}
          showingAnswer={showingAnswer}
          reviewTime={0}
          reviewCountdown={0}
          onToggleTimer={() => {}}
          onTogglePause={() => {}}
          onReviewTimeChange={() => {}}
        />

        <CardContent sx={{ p: 4 }}>
          <QuizCard
            currentKanji={currentWord?.kanji || ""}
            meaning={currentWord?.meaning || ""}
            onyomi={""}
            kunyomi={""}
            kanjiAnimation={[]}
            kanjiVideo={null}
            input={input}
            message={message}
            showingAnswer={showingAnswer}
            timeLeft={0}
            isMobile={false}
            isTablet={false}
            countdown={null}
            onInputChange={setInput}
            onKeyPress={(e) => {
              if (e.key === "Enter") checkAnswer();
            }}
            onPrevWord={() => {}}
            onCheckAnswer={checkAnswer}
            onNextWord={nextWord}
          />
        </CardContent>
      </Paper>

      <WrongWordsModal
        open={false}
        onClose={() => {}}
        wrongWords={wrongWords}
        onStartPractice={() => {}}
      />
      <Typography variant="body2" color="white" align="center" p={2}>
        © 2025 From Trieu先生 with ❤️. All rights reserved.
      </Typography>

      
    </Container>
  );
};

export default JLPTKanji;